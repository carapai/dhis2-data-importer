import {action, computed, configure, observable} from 'mobx';
import _ from "lodash";
import axios from 'axios';

import {convertAggregate} from '../utils'
import saveAs from 'file-saver';
configure({
    enforceActions: "observed"
});

class IntegrationStore {

    @observable dataSets = [];
    @observable dataSet = {};
    @observable d2 = {};
    @observable error = '';
    @observable activeAggregateStep = 0;
    @observable skipped = new Set();
    @observable completedAggregate = new Set();
    @observable aggregateSteps = ['MAPPINGS', 'DATA SETS', 'IMPORT OPTIONS', 'DATA SET MAPPING', 'PRE-IMPORT SUMMARY', 'IMPORT SUMMARY'];
    @observable totalAggregateSteps = 6;
    @observable multipleCma = {};

    @observable hasMappingsNameSpace;

    @observable aggregate;
    @observable aggregates = [];

    @observable schedulerEnabled = true;

    @observable isFull = true;

    @observable uploadData = false;
    @observable importData = false;

    @observable scheduleTypes = [{
        value: 'Second',
        label: 'Second',
    }, {
        value: 'Minute',
        label: 'Minute',
    }, {
        value: 'Hour',
        label: 'Hour',
    }];


    @observable aggregateJump = false;
    @observable loading = false;

    log = args => {
        // const program = {...args};
    };

    delete = args => {
        args.deleteMapping(this.mappings);
    };

    deleteAgg = args => {
        args.deleteAggregate(this.aggregates);
    };

    schedule = args => {
        args.scheduleProgram(this.mappings);
    };

    upload = args => {
        this.setDataSet(args);
        this.setUpload(true);
    };


    @observable tableAggActions = {
        logs: this.log,
        delete: this.deleteAgg,
        upload: this.upload
    };

    @action setD2 = (d2) => {
        this.d2 = d2;
    };

    @action setNextAggregationLevel = val => this.activeAggregateStep = val;

    @action
    handleNextAggregate = () => {
        this.setNextAggregationLevel(this.activeAggregateStep + 1);
    };

    @action goFull = () => {
        this.isFull = true;
    };

    @action setFull = val => {
        this.isFull = val;
    };


    @action
    handleAggregateBack = () => {
        if (this.activeAggregateStep === 2 && this.aggregateJump) {
            this.activeAggregateStep = 0;
        } else {
            this.activeAggregateStep = this.activeAggregateStep - 1
        }
    };


    @action
    saveAggregate = () => {
        this.dataSet.saveAggregate(this.aggregates);
    };



    @action changeAggregateSet = (step) => {
        this.activeAggregateStep = step;
    };

    @action
    handleAggregateStep = step => () => {
        this.changeAggregateSet(step);
    };


    @action closeImportDialog = () => {
        console.log('This is silly');
        this.setImportData(false);
    };

    @action closeUploadDialog = () => {
        this.setUpload(false);
    };


    @action
    handleResetAggregate = () => {
        this.activeAggregateStep = 0;
        this.completedAggregate = new Set();
        this.skipped = new Set();
    };

    skippedSteps() {
        return this.skipped.size;
    }

    isAggregateStepComplete(step) {
        return this.completedAggregate.has(step);
    }



    allAggregateStepsCompleted() {
        return this.completedAggregate === this.totalAggregateSteps - this.skippedSteps();
    }


    @action
    executeEditIfAllowedAgg = async model => {
        // const api = this.d2.Api.getApi();
        // const {dataValues} = await api.get('dataSets/' + model.id + '/dataValueSet', {});
        const {data} = await axios.get('http://localhost:3001/' + model.id);
        const {dataValues} = data;
        model = {
            ...model,
            dataValues
        };
        this.setDataSet(convertAggregate(model, this.d2));

        const maxAggregate = _.maxBy(this.aggregates, 'aggregateId');


        if (maxAggregate) {
            this.dataSet.setAggregateId(maxAggregate.aggregateId + 1);
        } else {
            this.dataSet.setAggregateId(1);
        }

        this.handleNextAggregate();
    };

    @action
    useSaved = model => {
        this.program = model;
        this.jump = true;
        this.activeStep = this.activeStep + 2;
    };

    @action
    useSavedAggregate = model => {
        this.dataSet = model;
        this.aggregateJump = true;
        this.activeAggregateStep = this.activeAggregateStep + 2;
    };

    @action fetchDataValues = async () => {
        const api = this.d2.Api.getApi();
        const {dataValues} = await api.get('dataSets/' + this.dataSet.id + '/dataValueSet', {});
        this.setDataSet({
            ...this.dataSet,
            dataValues
        })
    };


    @action
    fetchDataSets = async () => {
        // const api = this.d2.Api.getApi();
        try {
            // let {dataSets} = await api.get('dataSets', {
            //     paging: false,
            //     fields: 'id,name,code,periodType,categoryCombo[id,name,categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[id,name,categoryOptions[id,code,name]]],dataSetElements[dataElement[id,name,code,valueType,categoryCombo[id,name,categoryOptionCombos[id,name]]]],organisationUnits[id,name,code]'
            // });

            let {data} = await axios.get('http://localhost:3001/dataSets');
            let dataSets = data;
            dataSets = dataSets.map(dataSet => {
                const groupedDataElements = _.groupBy(dataSet['dataSetElements'], 'dataElement.categoryCombo.id');

                const forms = _.map(groupedDataElements, v => {
                    const dataElements = v.map(des => {
                        return {
                            id: des.dataElement.id,
                            name: des.dataElement.name,
                            code: des.dataElement.code,
                            valueType: des.valueType
                        };
                    });
                    const categoryOptionCombos = v[0]['dataElement']['categoryCombo']['categoryOptionCombos'];
                    return {
                        dataElements,
                        categoryOptionCombos
                    }
                });

                const organisationUnits = dataSet['organisationUnits'];

                return {
                    ..._.pick(dataSet, ['id', 'name', 'code', 'periodType', 'categoryCombo']),
                    organisationUnits,
                    forms
                };
            });
            this.setDataSets(dataSets);
        } catch (e) {
            console.log(e)
        }
    };


    @action checkAggregateDataStore = async () => {
        const val = await this.d2.dataStore.has('bridge');
        if (!val) {
            await this.createAggregateDataStore()
        } else {
            await this.fetchSavedAggregates();
        }
    };

    @action fetchSavedAggregates = async () => {

        try {
            const namespace = await this.d2.dataStore.get('bridge');
            const aggregates = await namespace.get('aggregates');

            const processedAggregates = aggregates.map(m => {
                return convertAggregate(m, this.d2);
            });
            this.setAggregates(processedAggregates);
        } catch (e) {
            console.log(e)
        }
    };

    @action createAggregateDataStore = async () => {
        try {
            const namespace = await this.d2.dataStore.create('bridge');
            namespace.set('aggregates', this.aggregates);
        } catch (e) {
            console.log(e);
        }
    };

    @action setDataSets = val => this.dataSets = val;
    @action setDataSet = val => this.dataSet = val;
    @action setAggregate = val => this.aggregate = val;
    @action setAggregates = val => this.aggregates = val;
    @action setLoading = val => this.loading = val;
    @action setUpload = val => this.uploadData = val;
    @action setImportData = val => this.importData = val;

    @action downloadAggregate = () => {
        if(this.dataSet.processed && this.dataSet.processed.length > 0 ){
            const blob = new Blob([JSON.stringify({dataValues: this.dataSet.processed}, null, 2)], {type : 'application/json'});

            saveAs(blob, "data.json");
        }
    };

    @computed
    get disableNextAggregate() {
        if (this.activeAggregateStep === 2) {
            return !this.dataSet
                || !this.dataSet.data
                || this.dataSet.data.length === 0
                || !this.dataSet.ouMapped
                || !this.dataSet.periodMapped
                || this.dataSet.dataStartColumn.length === 0
                || this.dataSet.dataStartColumn.length === 0
                || this.dataSet.typeOfSupportColumn.length === 0
        }
        return false;
    }

    @computed
    get disableDownload() {
        if (this.activeAggregateStep === 5) {
            return this.dataSet.processed === 0

        }
        return false;
    }

    @computed
    get disableDownload2() {
        return !this.dataSet.processed || this.dataSet.processed.length === 0
    }

    @computed
    get nextAggregateLabel() {
        if (this.activeAggregateStep === 0) {

            return 'New Mapping';
        } else if (this.activeAggregateStep === 4) {
            return 'Submit'
        } else {
            return 'Next';
        }
    }

    @computed
    get finishAggregateLabel() {
        if (this.activeAggregateStep === 5) {
            return 'Cancel'
        } else {
            return 'Finish';
        }
    }
}

const store = new IntegrationStore();
export default store;
