import {action, computed, configure, observable} from 'mobx';
import _ from "lodash";
import saveAs from 'file-saver';
import {convert, convertAggregate} from '../utils'
import {NotificationManager} from "react-notifications";


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
    @observable steps = ['MAPPINGS', 'SELECT PROGRAM', 'DATA', 'ATTRIBUTES', 'PROGRAM STAGES', 'PRE-IMPORT SUMMARY', 'DATA IMPORT', 'MAPPING DETAILS'];
    @observable aggregateSteps = ['MAPPINGS', 'DATA SETS', 'IMPORT OPTIONS', 'DATA SET MAPPING', 'PRE-IMPORT SUMMARY', 'IMPORT SUMMARY', 'MAPPING DETAILS'];
    @observable totalSteps = 8;
    @observable totalAggregateSteps = 7;
    @observable multipleCma = {};
    @observable mappings = [];
    @observable tracker;
    @observable dataElements = [];
    @observable userGroups = [];
    @observable search = '';

    @observable params = [];

    @observable programsFilter = '';
    @observable expanded;
    @observable hasMappingsNameSpace;

    @observable aggregate;
    @observable aggregates = [];

    @observable schedulerEnabled = true;

    @observable isFull = true;
    @observable dialogOpen = false;
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
    @observable open = true;

    @observable paging = {
        d1: {
            page: 0,
            rowsPerPage: 10
        },
        d2: {
            page: 0,
            rowsPerPage: 10
        },
        d3: {
            page: 0,
            rowsPerPage: 10
        },

        step1: {
            page: 0,
            rowsPerPage: 10
        }
    };

    @action setDialogOpen = val => this.dialogOpen = val;
    @action openDialog = () => this.setDialogOpen(true);
    @action closeDialog = () => this.setDialogOpen(false);

    @action setOpen = val => this.open = val;

    @action handleDrawerOpen = () => {
        this.setOpen(true)
    };

    @action handleDrawerClose = () => {
        const open = !this.open;
        this.setOpen(open)
    };

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

    importAgg = args => {
        if (args.templateType === "1") {
            this.setDataSet(args);
            this.setImportData(true);
        } else {
            NotificationManager.warning(`Mapping type does not support API import`, 'Warning');
        }
    };

    downloadData = args => {
        const blob = new Blob([JSON.stringify(args.canBeSaved, null, 2)], {type: 'application/json'});
        saveAs(blob, "data.json");
    };


    @observable tableActions = {
        download: this.import,
        upload: this.upload,
        template: this.downloadData,
        delete: this.delete
    };

    @observable tableAggActions = {
        upload: this.uploadAgg,
        download: this.importAgg,
        template: this.downloadData,
        delete: this.deleteAgg

    };

    @observable otherAggActions = {
        log: this.log
    };

    @action setSearch = val => {
        this.search = val;
    };

    @action searchDataSets = val => {
        const programs = this.dataSets.filter(v => {
            return v
        });

        this.setPrograms(programs);
    };

    @action downloadProgramData = () => {
        const {
            newTrackedEntityInstances,
            newEnrollments,
            newEvents,
            trackedEntityInstancesUpdate,
            eventsUpdate
        } = this.program.processed;


        if (newTrackedEntityInstances.length > 0) {
            const blob = new Blob([JSON.stringify({trackedEntityInstances: newTrackedEntityInstances}, null, 2)], {type: 'application/json'});
            saveAs(blob, "NewTrackedEntityInstances.json");
        }

        if (trackedEntityInstancesUpdate.length > 0) {
            const blob = new Blob([JSON.stringify({trackedEntityInstances: trackedEntityInstancesUpdate}, null, 2)], {type: 'application/json'});
            saveAs(blob, "TrackedEntityInstancesUpdate.json");
        }

        if (newEnrollments.length > 0) {
            const blob = new Blob([JSON.stringify({enrollments: newEnrollments}, null, 2)], {type: 'application/json'});
            saveAs(blob, "NewEnrollments.json");
        }

        if (newEvents.length > 0) {
            const blob = new Blob([JSON.stringify({events: newEvents}, null, 2)], {type: 'application/json'});
            saveAs(blob, "NewEvents.json");
        }

        if (newEvents.length > 0) {
            const blob = new Blob([JSON.stringify({events: eventsUpdate}, null, 2)], {type: 'application/json'});
            saveAs(blob, "EventsUpdate.json");
        }

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

        if (this.activeStep === 8) {
            this.saveMapping();
            this.activeStep = 0
        }
    };

    @action setNextAggregationLevel = val => this.activeAggregateStep = val;

    @action
    handleNextAggregate = async () => {

        if (this.dataSet.isDhis2 && this.activeAggregateStep === 3) {
            // this.setNextAggregationLevel(this.activeAggregateStep + 2)
            this.setNextAggregationLevel(this.activeAggregateStep + 1);
            this.handleNextAggregate();
        } else {
            this.setNextAggregationLevel(this.activeAggregateStep + 1);
        }

        if (this.activeAggregateStep === 7) {
            await this.saveAggregate();
            this.changeAggregateSet(0)
        }
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
        } else if (this.dataSet.isDhis2 && this.activeAggregateStep === 5) {
            this.activeAggregateStep = this.activeAggregateStep - 2
        } else {
            this.activeAggregateStep = this.activeAggregateStep - 1
        }
    };

    @action
    saveMapping = () => {
        this.program.saveMapping(this.mappings);
    };

    @action
    saveAggregate = async () => {
        await this.dataSet.saveAggregate(this.aggregates);
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
        this.setImportData(false);
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
        this.openDialog();
        try {
            const api = this.d2.Api.getApi();
            const {dataValues} = await api.get('dataSets/' + model.id + '/dataValueSet', {});
            model.forms.forEach(f => {
                const des = f.dataElements.map(de => de.id);
                f.categoryOptionCombos.forEach(coc => {

                    const filtered = dataValues.filter(dv => {
                        return dv.categoryOptionCombo === coc.id && des.indexOf(dv.dataElement) !== -1
                    });

                    const mappings = filtered.map(m => {
                        return [m.dataElement, null]
                    });

                    coc.mapping = _.fromPairs(mappings);
                });
            });

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
            await this.handleNextAggregate();
            this.openDialog();
        } catch (e) {
            this.closeDialog();
            NotificationManager.error(`${e.message} could not fetch data value sets`, 'Error', 5000);
        }
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
        this.openDialog();
        const api = this.d2.Api.getApi();
        try {
            const {programs} = await api.get('programs', {
                paging: false,
                fields: 'id,name,displayName,lastUpdated,programType,trackedEntityType,trackedEntity,programTrackedEntityAttributes[mandatory,valueType,trackedEntityAttribute[id,code,name,displayName,unique,optionSet[options[name,code]]]],programStages[id,name,displayName,repeatable,programStageDataElements[compulsory,dataElement[id,code,valueType,name,displayName,optionSet[options[name,code]]]]],organisationUnits[id,code,name]'
            });
            this.setPrograms(programs);
            this.toggleLoading(false);
            this.closeDialog();
        } catch (e) {
            NotificationManager.error(`${e.message} could not fetch programs`, 'Error', 5000);
            this.closeDialog();
        }
    };

    @action
    fetchDataSets = async () => {
        this.openDialog();
        const api = this.d2.Api.getApi();
        try {
            let {dataSets} = await api.get('dataSets', {
                paging: false,
                fields: 'id,name,code,periodType,categoryCombo[id,name,categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[id,name,categoryOptions[id,name]]],dataSetElements[dataElement[id,name,code,valueType,categoryCombo[id,name,categoryOptionCombos[id,name]]]],organisationUnits[id,name,code],organisationUnits[id,name,code]'
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
            this.closeDialog();
        } catch (e) {
            this.closeDialog();
            NotificationManager.error(`${e.message} could not fetch data sets`, 'Error', 5000);
        }

    };


    @action checkAggregateDataStore = async () => {
        this.openDialog();
        const val = await this.d2.dataStore.has('bridge');
        if (!val) {
            await this.createAggregateDataStore()
        } else {
            await this.fetchSavedAggregates();
        }
        this.closeDialog();
    };

    @action checkDataStore = async () => {
        this.setLoading(true);
        this.openDialog();
        const val = await this.d2.dataStore.has('bridge');
        if (!val) {
            await this.createDataStore()
        } else {
            await this.fetchSavedMappings();
        }

        this.setLoading(false);
        this.closeDialog();
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
            NotificationManager.error(`${e.message} could not fetch saved mappings`, 'Error', 5000);
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
            NotificationManager.error(`${e.message} could not fetch saved aggregate mappings`, 'Error', 5000);
        }
    };

    @action createDataStore = async () => {

        try {
            const namespace = await this.d2.dataStore.create('bridge');
            namespace.set('mappings', this.mappings);
        } catch (e) {
            NotificationManager.error('Could not create data store', 'Error', 5000);
        }
    };

    @action createAggregateDataStore = async () => {
        try {
            const namespace = await this.d2.dataStore.create('bridge');
            namespace.set('aggregates', this.aggregates);
        } catch (e) {
            NotificationManager.error('Could not create data store', 'Error', 5000);
        }
    };

    @action
    toggleLoading = (val) => {
        this.loading = val;
    };

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
    @action setPaging = val => this.paging = val;

    @action fetchDataElements = () => {
        this.d2.models.dataElement.list({
            paging: false,
            fields: 'id,name,code',
            filter: 'domainType:eq:AGGREGATE'
        }).then(action(response => {
            this.dataElements = response.toArray();
        }), action(e => {
            console.log(e);
        }))
    };

    @action fetchUserGroups = () => {
        this.d2.models.userGroups.list({
            paging: false,
        }).then(action(response => {
            this.userGroups = response.toArray();
        }), action(e => {
            console.log(e);
        }))
    };
    @action
    handleChange = (dataElement, group) => event => {
        console.log(event);
        // this.setState({ [name]: event.target.checked });
    };

    @action
    handleChangeElementPage = what => (event, page) => {
        const current = this.paging[what];
        const change = {};
        if (current) {
            change.page = page;
            change.rowsPerPage = current.rowsPerPage;
            const data = _.fromPairs([
                [what, change]
            ]);

            const p = {
                ...this.paging,
                ...data
            };

            this.setPaging(p);
        }
    };

    @action
    handleChangeElementRowsPerPage = what => event => {
        const current = this.paging[what];
        const change = {};
        if (current) {
            change.rowsPerPage = event.target.value;
            change.page = current.page;
            const data = _.fromPairs([
                [what, change]
            ]);
            const p = {
                ...this.paging,
                ...data
            };

            this.setPaging(p);
        }
    };

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
        }

        // else if (this.activeStep === 5) {
        //     return this.program.disableCreate;
        // }
        return false;
    }


    @computed
    get disableNextAggregate() {
        if (this.activeAggregateStep === 2) {
            if (this.dataSet.templateType === '1') {
                if (this.dataSet.isDhis2 && this.dataSet.dhis2DataSet) {
                    return false;
                }
                return _.keys(this.dataSet.data).length === 0
                    || !this.dataSet.ouMapped
                    // || !this.dataSet.allAttributesMapped
                    || !this.dataSet.periodMapped
                    || !this.dataSet.dataElementColumn
                    || !this.dataSet.categoryOptionComboColumn
                    || !this.dataSet.dataValueColumn;
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
        } else if (this.activeAggregateStep === 4) {
            return !this.dataSet.isDhis2 && (!this.dataSet.processed || this.dataSet.processed.length === 0)
        }
        return false;
    }

    @computed
    get nextLabel() {
        if (this.activeStep === 0) {
            return 'New Mapping';
        } else if (this.activeStep === 5) {
            return 'Import';
        } else if (this.activeStep === 7) {

            return 'Save & Finish'
        } else {
            return 'Next';
        }
    }

    @computed
    get nextAggregateLabel() {
        if (this.activeAggregateStep === 0) {
            return 'New Mapping';
        } else if (this.activeAggregateStep === 4) {
            return 'Import';
        } else if (this.activeAggregateStep === 6) {
            return 'Save & Finish'
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

    @computed get rows() {
        return this.dataElements.length + 1;
    }

    @computed get columns() {
        return this.userGroups.length + 1;
    }

    @computed get searchedDataSets() {
        if (this.search !== '') {
            return this.dataSets.filter(v => {
                return v.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
            })
        }

        return this.dataSets;

    }

    @computed get currentDataSets() {
        const info = this.paging['d1'];
        return this.searchedDataSets.slice(info.page * info.rowsPerPage, info.page * info.rowsPerPage + info.rowsPerPage);

    }

    @computed get searchedPrograms() {
        if (this.search !== '') {
            return this.programs.filter(v => {
                return v.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
            })
        }

        return this.programs;

    }

    @computed get currentPrograms() {
        const info = this.paging['step1'];
        return this.searchedPrograms.slice(info.page * info.rowsPerPage, info.page * info.rowsPerPage + info.rowsPerPage);

    }
}

const store = new IntegrationStore();
export default store;
