import {action, computed, configure, observable, toJS} from 'mobx';
import _ from "lodash";
import OptionSet from "./OptionSet";
import DataElement from "./DataElement";
import ProgramStageDataElement from "./ProgramStageDataElement";
import ProgramStage from "./ProgramStage";
import TrackedEntityAttribute from "./TrackedEntityAttribute";
import ProgramTrackedEntityAttribute from "./ProgramTrackedEntityAttribute";
import Program from "./Program";
import TrackedEntityType from "./TrackedEntityType";
import Option from './Option';
import Element from "./Element";
import CategoryCombo from "./CategoryCombo";
import CategoryOptionCombo from "./CategoryOptionCombo";
import DataSet from "./DataSet";
import Form from "./Form";
import OrganisationUnit from "./OrganisationUnit";
import Category from "./Category";
import CategoryOption from "./CategoryOption";

configure({enforceActions: "observed"});

class IntegrationStore {

    @observable programs = [];
    @observable dataSets = [];
    @observable program;
    @observable dataSet;
    @observable d2 = {};
    @observable trackedEntityInstances = [];
    @observable error = '';
    @observable activeStep = 0;
    @observable activeAggregateStep = 0;
    @observable skipped = new Set();
    @observable completed = new Set();
    @observable completedAggregate = new Set();
    @observable steps = ['MAPPINGS', 'PROGRAMS', 'DATA', 'ATTRIBUTES', 'PROGRAM STAGES', 'PRE-IMPORT SUMMARY', 'DATA IMPORT'];
    @observable aggregateSteps = ['MAPPINGS', 'DATA', 'DATA SETS', 'ATTRIBUTES', 'PROGRAM STAGES', 'PRE-IMPORT SUMMARY', 'DATA IMPORT'];
    @observable totalSteps = 7;
    @observable totalAggregateSteps = 7;
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

    delete = args => {
        args.deleteMapping(this.mappings);
    };

    schedule = args => {
        args.scheduleProgram(this.mappings);
    };

    @observable tableActions = {
        logs: this.log,
        delete: this.delete,
        schedule: this.schedule
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
        model.orgUnitStrategy = {value: 'auto', label: 'auto'};
        model.schedule = 30;
        model.scheduleType = {value: 'Minute', label: 'Minute'};


        this.program = this.convert(model);

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
        model = {...model, dataValues};
        this.setDataSet(this.convertAggregate(model));

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
        this.setDataSet({...this.dataSet, dataValues})
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
                    return {dataElements, categoryOptionCombos}
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
        const val = await this.d2.dataStore.has('bridge');
        if (!val) {
            await this.createDataStore()
        } else {
            await this.fetchSavedMappings();
        }
        // this.d2.dataStore.has('bridge').then(this.checkDataStoreSuccess, this.fetchProgramsError)
    };

    @action fetchSavedMappings = async () => {
        try {
            const namespace = await this.d2.dataStore.get('bridge');
            const mappings = await namespace.get('mappings');
            const processedMappings = mappings.map(m => {
                return this.convert(m);
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
                return this.convertAggregate(m);
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
            return this.convert(m);
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


    @action toggleCanCreateEvents() {
        this.createNewEvents = true;
    }

    @action setPrograms = val => this.programs = val;
    @action setDataSets = val => this.dataSets = val;
    @action setDataSet = val => this.dataSet = val;
    @action setMappings = val => this.mappings = val;
    @action setAggregate = val => this.aggregate = val;
    @action setAggregates = val => this.aggregates = val;

    @computed get disableNext() {
        if (this.activeStep === 2) {
            return !this.program.data || this.program.data.length === 0
                || !this.program.orgUnitColumn
                || (!this.program.eventDateColumn && this.program.createNewEvents)
                || ((!this.program.enrollmentDateColumn || !this.program.incidentDateColumn) && this.program.createNewEnrollments);
            // || (!this.program.createNewEnrollments && !this.program.createNewEvents);
        } else if (this.activeStep === 3 && this.program.createNewEnrollments) {
            return !this.program.mandatoryAttributesMapped;
        } else if (this.activeStep === 4) {
            return !this.program.compulsoryDataElements;
        } else if (this.activeStep === 5) {
            const {
                newTrackedEntityInstances,
                newEnrollments,
                newEvents,
                trackedEntityInstancesUpdate,
                eventsUpdate
            } = this.program.processed;
            return (newTrackedEntityInstances.length + newEnrollments.length + newEvents.length + eventsUpdate.length +
                trackedEntityInstancesUpdate.length) === 0;
        }
        return false;

    }

    @computed get disableNextAggregate() {

        if (this.activeAggregateStep === 2) {
            return !this.dataSet.data
        }

        return false;

    }

    @computed get nextLabel() {
        if (this.activeStep === 0) {
            return 'New Mapping';
        } else if (this.activeStep === 5) {
            const {
                conflicts,
                errors
            } = this.program.processed;
            if (errors.length > 0 || conflicts.length > 0) {
                return 'Submit Rejecting Errors & Conflicts'
            }
            return 'Submit'
        } else {
            return 'Next';
        }
    }

    @computed get nextAggregateLabel() {
        if (this.activeAggregateStep === 0) {

            return 'New Mapping';
        } else if (this.activeAggregateStep === 5) {
            return 'Submit'
        } else {
            return 'Next';
        }
    }

    @computed get finishLabel() {
        if (this.activeStep === 5) {
            return 'Cancel'
        } else {
            return 'Finish';
        }
    }

    @computed get finishAggregateLabel() {
        if (this.activeAggregateStep === 5) {
            return 'Cancel'
        } else {
            return 'Finish';
        }
    }

    convertAggregate = ds => {

        const grouped = _.groupBy(ds.dataValues, 'dataElement');

        const dataSet = new DataSet();

        const dateSetCategoryCombo = new CategoryCombo();
        dateSetCategoryCombo.setId(ds.categoryCombo.id);
        dateSetCategoryCombo.setCode(ds.categoryCombo.code);
        dateSetCategoryCombo.setName(ds.categoryCombo.name);


        const categories = ds.categoryCombo.categories.filter(c => c.name !== 'default').map(c => {
            const category = new Category(c.id, c.name, c.code);

            if (c.mapping) {
                category.setMapping(c.mapping);
            }


            const categoryOptions = c.categoryOptions.map(co => {
                return new CategoryOption(co.id, co.name, co.code);
            });

            category.setCategoryOptions(categoryOptions);

            return category

        });

        const dateSetCategoryOptionCombos = ds.categoryCombo.categoryOptionCombos.map(coc => {
            const categoryOptionCombo = new CategoryOptionCombo();
            categoryOptionCombo.setId(coc.id);
            categoryOptionCombo.setName(coc.name);
            return categoryOptionCombo;
        });

        dateSetCategoryCombo.setCategoryOptionCombos(dateSetCategoryOptionCombos);
        dateSetCategoryCombo.setCategories(categories);

        dataSet.setCategoryCombo(dateSetCategoryCombo);


        const forms = ds.forms.map(form => {

            const f = new Form();
            const dataElements = form.dataElements.map(de => {
                const dataElement = new Element();
                dataElement.setId(de.id);
                dataElement.setCode(de.code);
                dataElement.setName(de.name);
                dataElement.setValueType(de.valueType);
                dataElement.setMapping(de.mapping);

                return dataElement;

            });


            const cocs = grouped[form.dataElements[0]['id']];

            const groupedOption = _.groupBy(form.categoryOptionCombos, 'id');

            let categoryOptionCombos = cocs.map(coc => {
                const found = groupedOption[coc['categoryOptionCombo']];

                const categoryOptionCombo = new CategoryOptionCombo();

                if (found) {
                    categoryOptionCombo.setId(found[0].id);
                    categoryOptionCombo.setName(found[0].name);
                    categoryOptionCombo.setMapping(found[0].mapping || {});
                    categoryOptionCombo.setCell(found[0].cell || {});
                }
                return categoryOptionCombo;

            });

            f.setCategoryOptionCombos(categoryOptionCombos);
            f.setDataElements(dataElements);

            return f;

        });

        dataSet.setForms(forms);

        dataSet.setD2(this.d2);

        dataSet.setId(ds.id);
        dataSet.setCode(ds.code);
        dataSet.setName(ds.name);
        dataSet.setPeriodType(ds.periodType);
        dataSet.setPeriodType(ds.periodType);
        dataSet.setDataValues(ds.dataValues);
        dataSet.setOrgUnitColumn(ds.orgUnitColumn);
        dataSet.setOrgUnitStrategy(ds.orgUnitStrategy);
        dataSet.setPeriodColumn(ds.periodColumn);
        dataSet.setDataSetColumn(ds.dataSetColumn);
        dataSet.setDataElementColumn(ds.dataElementColumn);
        dataSet.setCategoryOptionComboColumn(ds.categoryOptionComboColumn);
        dataSet.setDataValueColumn(ds.dataValueColumn);
        dataSet.setHeaderRow(ds.headerRow || 1);
        dataSet.setDataStartRow(ds.dataStartRow || 2);

        const ous = ds.organisationUnits.map(ou => {
            return new OrganisationUnit(ou.id, ou.name, ou.code)
        });

        dataSet.setOrganisationUnits(ous);

        dataSet.setOrganisation(ds.organisation);
        dataSet.setPeriodCell(ds.periodCell);
        dataSet.setPeriod(ds.period);
        dataSet.setOrganisationCell(ds.organisationCell);
        dataSet.setFixedExcel(ds.fixedExcel);

        return dataSet;

    };

    convert = program => {
        let programStages = [];
        let programTrackedEntityAttributes = [];
        program.programStages.forEach(ps => {
            let programStageDataElements = [];
            ps.programStageDataElements.forEach(psd => {
                let optionSet = null;
                if (psd.dataElement.optionSet) {
                    let options = [];

                    psd.dataElement.optionSet.options.forEach(o => {
                        const option = new Option(o.code, o.name);
                        option.setValue(o.value || null);
                        options = [...options, option];
                    });
                    optionSet = new OptionSet(options)
                }

                const dataElement = new DataElement(psd.dataElement.id,
                    psd.dataElement.code,
                    psd.dataElement.name,
                    psd.dataElement.displayName,
                    psd.dataElement.valueType,
                    optionSet
                );
                dataElement.setAsIdentifier(psd.dataElement.identifiesEvent || false);
                const programStageDataElement = new ProgramStageDataElement(psd.compulsory, dataElement);
                if (psd.column) {
                    programStageDataElement.setColumn(psd.column);
                } else {
                    programStageDataElement.setColumn({name: null, value: null});
                }
                programStageDataElements = [...programStageDataElements, programStageDataElement];
            });
            const programsStage = new ProgramStage(
                ps.id,
                ps.name,
                ps.displayName,
                ps.repeatable,
                programStageDataElements
            );
            programsStage.setEventDateAsIdentifier(ps.eventDateIdentifiesEvent || false);
            programsStage.setLongitudeColumn(ps.longitudeColumn);
            programsStage.setLatitudeColumn(ps.latitudeColumn);
            programStages = [...programStages, programsStage]
        });

        program.programTrackedEntityAttributes.forEach(pa => {
            let optionSet = null;
            if (pa.trackedEntityAttribute.optionSet) {
                let options = [];

                pa.trackedEntityAttribute.optionSet.options.forEach(o => {
                    const option = new Option(o.code, o.name);
                    option.setValue(o.value || null);
                    options = [...options, option];
                });
                optionSet = new OptionSet(options)
            }

            const trackedEntityAttribute = new TrackedEntityAttribute(
                pa.trackedEntityAttribute.id,
                pa.trackedEntityAttribute.code,
                pa.trackedEntityAttribute.name,
                pa.trackedEntityAttribute.displayName,
                pa.trackedEntityAttribute.unique,
                optionSet
            );

            const programTrackedEntityAttribute = new ProgramTrackedEntityAttribute(
                pa.valueType,
                pa.mandatory,
                trackedEntityAttribute
            );
            if (pa.column) {
                programTrackedEntityAttribute.setColumn(pa.column);
            }
            programTrackedEntityAttributes = [...programTrackedEntityAttributes, programTrackedEntityAttribute]

        });

        const p = new Program(
            program.lastUpdated,
            program.name,
            program.id,
            program.programType,
            program.displayName,
            programStages,
            programTrackedEntityAttributes
        );

        p.setOrganisationUnits(program.organisationUnits);

        if (program.trackedEntityType && program.trackedEntityType.id) {
            p.setTrackedEntityType(new TrackedEntityType(program.trackedEntityType.id))
        } else if (program.trackedEntity && program.trackedEntity) {
            p.setTrackedEntity(new TrackedEntityType(program.trackedEntity.id))
        }

        p.setD2(this.d2);
        p.setOrder(program.order);
        p.setOrderBy(program.orderBy);
        p.setOrgUnitStrategy(program.orgUnitStrategy);
        p.setHeaderRow(program.headerRow || 1);
        p.setDataStartRow(program.dataStartRow || 2);
        p.setCreateNewEvents(program.createNewEvents);
        p.setCreateNewEnrollments(program.createNewEnrollments);
        p.setEventDateColumn(program.eventDateColumn);
        p.setEnrollmentDateColumn(program.enrollmentDateColumn);
        p.setIncidentDateColumn(program.incidentDateColumn);
        p.setUrl(program.url || '');
        p.setDateFilter(program.dateFilter || '');
        p.setLastRun(program.lastRun);
        p.setUploaded(program.uploaded);
        p.setUploadMessage(program.uploadMessage);
        p.setOrgUnitColumn(program.orgUnitColumn);
        p.setMappingId(program.mappingId);
        p.setLatitudeColumn(program.latitudeColumn);
        p.setLongitudeColumn(program.longitudeColumn);
        p.setDateEndFilter(program.dateEndFilter || '');
        p.setScheduleTime(program.scheduleTime || 0);

        return p;
    }
}

const store = new IntegrationStore();
export default store;
