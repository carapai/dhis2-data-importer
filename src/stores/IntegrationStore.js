import {action, computed, configure, observable, toJS} from 'mobx';
import _ from "lodash";

import {convert, convertAggregate} from '../utils'

configure({
    enforceActions: "observed"
});

class IntegrationStore {

    @observable programs = [];
    @observable dataSets = [];
    @observable program = {};
    @observable dataSet = {};
    @observable d2 = {};
    @observable trackedEntityInstances = [];
    @observable error = '';
    @observable activeStep = 0;
    @observable activeAggregateStep = 0;
    @observable skipped = new Set();
    @observable completed = new Set();
    @observable completedAggregate = new Set();
    @observable steps = ['MAPPINGS', 'PROGRAMS', 'DATA', 'ATTRIBUTES', 'PROGRAM STAGES', 'PRE-IMPORT SUMMARY', 'DATA IMPORT'];
    @observable aggregateSteps = ['MAPPINGS', 'DATA SETS', 'IMPORT OPTIONS', 'DATA SET MAPPING', 'PRE-IMPORT SUMMARY', 'IMPORT SUMMARY'];
    @observable totalSteps = 7;
    @observable totalAggregateSteps = 6;
    @observable multipleCma = {};
    @observable mappings = [];
    @observable tracker;

    @observable programsFilter = '';
    @observable expanded;
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


    @observable jump = false;
    @observable aggregateJump = false;
    @observable loading = false;

    log = args => {
        // const program = {...args};
    };

    upload = args => {
        this.setProgram(args);
        this.setUpload(true);
    };

    uploadAgg = args => {
        this.setDataSet(args);
        this.setUpload(true);
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

    import = args => {
        this.setProgram(args);
        this.setImportData(true);
    };


    @observable tableActions = {
        // logs: this.log,
        delete: this.delete,
        schedule: this.schedule,
        download: this.import,
        upload: this.upload
    };

    @observable tableAggActions = {
        delete: this.deleteAgg,
        upload: this.uploadAgg
    };


    @action setD2 = (d2) => {
        this.d2 = d2;
    };

    @action
    handleNext = () => {
        if (this.activeStep === 2 && !this.program.isTracker) {
            this.activeStep = this.activeStep + 2;
        } else {
            this.activeStep = this.activeStep + 1;
        }
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
    handleBack = () => {
        if (this.activeStep === 4 && !this.program.isTracker) {
            this.activeStep = this.activeStep - 2;
        } else if (this.activeStep === 2 && this.jump) {
            this.activeStep = 0;
        } else {
            this.activeStep = this.activeStep - 1
        }
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
    saveMapping = () => {
        this.program.saveMapping(this.mappings);
    };

    @action
    saveAggregate = () => {
        this.dataSet.saveAggregate(this.aggregates);
    };

    @action changeSet = (step) => {
        this.activeStep = step;
    };

    @action
    handleStep = step => () => {
        this.changeSet(step);
    };


    @action changeAggregateSet = (step) => {
        this.activeAggregateStep = step;
    };

    @action
    handleAggregateStep = step => () => {
        this.changeAggregateSet(step);
    };

    @action
    handleComplete = () => {
        const completed = new Set(this.completed);
        completed.add(this.activeStep);
        this.completed = completed;
        if (completed.size !== this.totalSteps() - this.skippedSteps()) {
            this.handleNext();
        }
    };

    @action closeImportDialog = () => {
        this.setImportData(false);
    };

    @action closeUploadDialog = () => {
        this.setUpload(false);
    };

    @action
    handleReset = () => {
        this.activeStep = 0;
        this.completed = new Set();
        this.skipped = new Set();
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

    isStepComplete(step) {
        return this.completed.has(step);
    }

    isAggregateStepComplete(step) {
        return this.completedAggregate.has(step);
    }


    allStepsCompleted() {
        return this.completed === this.totalSteps - this.skippedSteps();
    }

    allAggregateStepsCompleted() {
        return this.completedAggregate === this.totalAggregateSteps - this.skippedSteps();
    }


    @action
    executeEditIfAllowed = model => {
        this.jump = false;
        model.createNewEvents = true;
        model.dataStartRow = 2;
        model.headerRow = 1;
        model.orgUnitStrategy = {
            value: 'auto',
            label: 'auto'
        };
        model.schedule = 30;
        model.scheduleType = {
            value: 'Minute',
            label: 'Minute'
        };


        this.program = convert(model, this.d2);
        const maxMapping = _.maxBy(this.mappings, 'mappingId');

        if (maxMapping) {
            this.program.setMappingId(maxMapping.mappingId + 1);
        } else {
            this.program.setMappingId(1);
        }

        this.handleNext()
    };

    @action
    executeEditIfAllowedAgg = async model => {
        const api = this.d2.Api.getApi();
        const {dataValues} = await api.get('dataSets/' + model.id + '/dataValueSet', {});
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

    @action
    fetchPrograms = async () => {
        const api = this.d2.Api.getApi();
        try {
            const {programs} = await api.get('programs', {
                paging: false,
                fields: 'id,name,displayName,lastUpdated,programType,trackedEntityType,trackedEntity,programTrackedEntityAttributes[mandatory,valueType,trackedEntityAttribute[id,code,name,displayName,unique,optionSet[options[name,code]]]],programStages[id,name,displayName,repeatable,programStageDataElements[compulsory,dataElement[id,code,valueType,name,displayName,optionSet[options[name,code]]]]],organisationUnits[id,code,name]'
            });
            this.setPrograms(programs);
            this.toggleLoading(false);
        } catch (e) {
            console.log(e);
        }
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
        const api = this.d2.Api.getApi();
        try {
            let {dataSets} = await api.get('dataSets', {
                paging: false,
                fields: 'id,name,code,periodType,categoryCombo[id,name,categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[id,name,categoryOptions[id,name]]],dataSetElements[dataElement[id,name,code,valueType,categoryCombo[id,name,categoryOptionCombos[id,name]]]],organisationUnits[id,name,code]'
            });
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

    @action checkDataStore = async () => {
        this.setLoading(true);
        const val = await this.d2.dataStore.has('bridge');
        if (!val) {
            await this.createDataStore()
        } else {
            await this.fetchSavedMappings();
        }

        this.setLoading(false);
    };

    @action fetchSavedMappings = async () => {
        try {
            const namespace = await this.d2.dataStore.get('bridge');
            const mappings = await namespace.get('mappings');
            const processedMappings = mappings.map(m => {
                return convert(m, this.d2);
            });
            this.setMappings(processedMappings);
        } catch (e) {
            console.log(e)
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
        /*.then(action(namespace => {
            .then(action(aggregates => {

            }), this.fetchProgramsError);
        }), this.fetchProgramsError);*/
    };

    @action createDataStore = async () => {

        try {
            const namespace = await this.d2.dataStore.create('bridge');
            namespace.set('mappings', this.mappings);
        } catch (e) {
            console.log(e);
        }
        // .then(this.createDataStoreSuccess, this.fetchProgramsError);
    };

    @action createAggregateDataStore = async () => {
        try {
            const namespace = await this.d2.dataStore.create('bridge');
            namespace.set('aggregates', this.aggregates);
        } catch (e) {
            console.log(e);
        }
    };

    @action
    toggleLoading = (val) => {
        this.loading = val;
    };

    /* @action.bound
     fetchProgramsSuccess({programs}) {
         this.programs = programs;
         this.toggleLoading(false);

     }*/

    @action.bound
    createDataStoreSuccess(namespace) {
        namespace.set('mappings', this.mappings);
    }

    @action.bound
    fetchSavedMappingSuccess(namespace) {
        namespace.get('mappings').then(this.fetchMappings, this.fetchProgramsError);
    }

    @action.bound
    savedMappingSuccess(namespace) {
        namespace.set('mappings', toJS(this.mappings));
    }

    @action.bound
    fetchMappings(mappings) {
        this.mappings = mappings.map(m => {
            return convert(m, this.d2);
        });
    }

    @action.bound
    checkDataStoreSuccess(val) {
        if (!val) {
            this.createDataStore()
        } else {
            this.fetchSavedMappings();
        }
    }

    @action.bound
    fetchProgramsError(error) {
        this.error = "error"
    }

    @action
    filterPrograms = (programsFilter) => {
        programsFilter = programsFilter.toLowerCase();
        this.programsFilter = programsFilter;
    };


    @action setExpanded = expanded => {
        this.expanded = expanded;
    };


    @action
    handlePanelChange = panel => (event, expanded) => {
        this.setExpanded(expanded ? panel : false);
    };


    @action
    toggleCanCreateEvents() {
        this.createNewEvents = true;
    }

    @action setPrograms = val => this.programs = val;
    @action setDataSets = val => this.dataSets = val;
    @action setDataSet = val => this.dataSet = val;
    @action setMappings = val => this.mappings = val;
    @action setAggregate = val => this.aggregate = val;
    @action setAggregates = val => this.aggregates = val;
    @action setLoading = val => this.loading = val;
    @action setUpload = val => this.uploadData = val;
    @action setImportData = val => this.importData = val;
    @action setProgram = val => this.program = val;

    @computed
    get disableNext() {
        if (this.activeStep === 2) {
            return !this.program.data || this.program.data.length === 0
                || !this.program.orgUnitColumn
                || (!this.program.eventDateColumn && (this.program.createNewEvents || this.program.updateEvents))
                || ((!this.program.enrollmentDateColumn || !this.program.incidentDateColumn) && this.program.createNewEnrollments);
            // || (!this.program.createNewEnrollments && !this.program.createNewEvents);
        } else if (this.activeStep === 3 && this.program.createNewEnrollments) {
            return !this.program.mandatoryAttributesMapped;
        } else if (this.activeStep === 4) {
            return !this.program.compulsoryDataElements;
        } else if (this.activeStep === 5) {
            const {newTrackedEntityInstances, newEnrollments, newEvents, trackedEntityInstancesUpdate, eventsUpdate} = this.program.processed;
            return (newTrackedEntityInstances.length + newEnrollments.length + newEvents.length + eventsUpdate.length +
                trackedEntityInstancesUpdate.length) === 0;
        }
        return false;

    }

    @computed
    get disableNextAggregate() {
        if (this.activeAggregateStep === 2) {
            console.log(this.dataSet.categoryCombo);
            if (this.dataSet.templateType === '1') {
                return !this.dataSet
                    || !this.dataSet.data
                    || this.dataSet.data.length === 0
                    || !this.dataSet.ouMapped
                    // || !this.dataSet.allAttributesMapped
                    || !this.dataSet.periodMapped
                    || !this.dataSet.dataElementColumn
                    || !this.dataSet.categoryOptionComboColumn
                    || !this.dataSet.dataValueColumn
            } else if (this.dataSet.templateType === '2') {
                return !this.dataSet
                    || !this.dataSet.data
                    || this.dataSet.data.length === 0
                    || !this.dataSet.ouMapped
                    // || !this.dataSet.allAttributesMapped
                    || !this.dataSet.periodMapped
            } else {
                return !this.dataSet
                    || !this.dataSet.data
                    || this.dataSet.data.length === 0
                    || !this.dataSet.ouMapped
                    // || !this.dataSet.allAttributesMapped
                    || !this.dataSet.periodMapped
                    || !this.dataSet.dataStartColumn
                    || this.dataSet.dataStartColumn.length === 0
            }
        }
        return false;
    }

    @computed
    get nextLabel() {
        if (this.activeStep === 0) {
            return 'New Mapping';
        } else if (this.activeStep === 5) {
            const {conflicts, errors} = this.program.processed;
            if (errors.length > 0 || conflicts.length > 0) {
                return 'Submit Rejecting Errors & Conflicts'
            }
            return 'Submit'
        } else {
            return 'Next';
        }
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
    get finishLabel() {
        if (this.activeStep === 5) {
            return 'Cancel'
        } else {
            return 'Finish';
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
