import {action, computed, observable} from 'mobx';
import _ from 'lodash';
import moment from 'moment';
import {generateUid} from 'd2/uid';
import {NotificationManager} from 'react-notifications';

import XLSX from 'xlsx';

import axios from 'axios';

class Program {
    @observable lastUpdated;
    @observable name;
    @observable id;
    @observable programType;
    @observable displayName;
    @observable programStages = [];
    @observable programTrackedEntityAttributes = [];
    @observable trackedEntityType;
    @observable trackedEntity;
    @observable mappingId = 1;
    @observable running = false;

    @observable orgUnitColumn = '';
    @observable orgUnitStrategy = {
        value: 'auto',
        label: 'auto'
    };
    @observable organisationUnits = [];

    @observable headerRow = 1;
    @observable dataStartRow = 2;

    @observable createNewEvents = false;
    @observable createNewEnrollments = false;

    @observable updateEvents = true;
    @observable createEntities = false;
    @observable updateEntities = true;

    @observable eventDateColumn = '';
    @observable enrollmentDateColumn = '';
    @observable incidentDateColumn = '';

    @observable url = '';
    @observable dateFilter = '';
    @observable dateEndFilter = '';
    @observable lastRun = '';

    @observable uploaded = 0;
    @observable uploadMessage = '';

    @observable page = 0;
    @observable rowsPerPage = 5;

    @observable paging = {
        nel: {page: 0, rowsPerPage: 10},
        nte: {page: 0, rowsPerPage: 10},
        nev: {page: 0, rowsPerPage: 10},
        teu: {page: 0, rowsPerPage: 10},
        evu: {page: 0, rowsPerPage: 10},
        err: {page: 0, rowsPerPage: 10},
        con: {page: 0, rowsPerPage: 10},
        dup: {page: 0, rowsPerPage: 10}
    };

    @observable orderBy = 'mandatory';
    @observable order = 'desc';
    @observable attributesFilter = '';

    @observable trackedEntityInstances = [];
    @observable d2;
    @observable fetchingEntities = 0;

    @observable responses = [];

    @observable increment = 0;

    @observable errors = [];
    @observable conflicts = [];
    @observable duplicates = [];

    @observable longitudeColumn;
    @observable latitudeColumn;

    @observable pulling = false;

    @observable workbook = null;

    @observable selectedSheet = null;

    @observable pulledData = null;

    @observable sheets = [];

    @observable dataSource = 1;

    @observable scheduleTime = 0;

    @observable percentages = [];

    @observable total = 0;
    @observable displayProgress = false;


    constructor(lastUpdated, name, id, programType, displayName, programStages, programTrackedEntityAttributes) {
        this.lastUpdated = lastUpdated;
        this.name = name;
        this.id = id;
        this.programType = programType;
        this.displayName = displayName;
        this.programStages = programStages;
        this.programTrackedEntityAttributes = programTrackedEntityAttributes;
    }

    @action
    setD2 = (d2) => {
        this.d2 = d2;
    };

    @action
    toggleDataPull() {
        this.dataPulled = !this.dataPulled;
    }


    @action
    handelHeaderRowChange = value => {
        this.headerRow = value;
        if (value) {
            this.handelDataRowStartChange(parseInt(value, 10) + 1)
        } else {
            this.handelDataRowStartChange('')
        }
    };

    @action
    handelDataRowStartChange = value => this.dataStartRow = value;

    @action
    handelScheduleTimeChange = value => this.scheduleTime = value;

    @action pushPercentage = val => this.percentages = [...this.percentages, val];

    @action
    handleOrgUnitSelectChange = value => this.orgUnitColumn = value;

    @action
    handleOrgUnitStrategySelectChange = value => this.orgUnitStrategy = value;

    @action
    handleCreateNewEventsCheck = event => {
        this.createNewEvents = event.target.checked;

        if (!this.createNewEvents && !this.updateEvents) {
            this.eventDateColumn = null;
        }
    };

    @action
    handleCreateNewEnrollmentsCheck = event => {
        this.createNewEnrollments = event.target.checked;

        if (!this.createNewEnrollments) {
            this.enrollmentDateColumn = null;
            this.incidentDateColumn = null;
        }
    };

    @action
    handleUpdateEventsCheck = event => {
        this.updateEvents = event.target.checked;
        if (!this.createNewEvents && !this.updateEvents) {
            this.eventDateColumn = null;
        }
    };

    @action
    handleChangeElementPage = what => (event, page) => {
        const current = this.paging[what];
        const change = {};
        if (current) {
            change.page = page;
            change.rowsPerPage = current.rowsPerPage;
            const data = _.fromPairs([[what, change]]);

            const p = {...this.paging, ...data};

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
            const data = _.fromPairs([[what, change]]);
            const p = {...this.paging, ...data};

            this.setPaging(p);
        }
    };

    @action
    handleCreateEntitiesCheck = event => {
        this.createEntities = event.target.checked;
    };

    @action
    handleUpdateEntitiesCheck = event => {
        this.updateEntities = event.target.checked;
    };

    @action
    handleEventDateColumnSelectChange = value => this.eventDateColumn = value;

    @action
    handleEnrollmentDateColumnSelectChange = value => this.enrollmentDateColumn = value;

    @action
    handleIncidentDateColumnSelectChange = value => this.incidentDateColumn = value;

    @action
    handelURLChange = value => this.url = value;

    @action
    handelDateFilterChange = value => this.dateFilter = value;

    @action
    handelDateEndFilterChange = value => this.dateEndFilter = value;

    @action
    handelScheduleChange = value => this.schedule = value.target.value;

    @action
    scheduleTypeChange = () => action(value => {
        this.scheduleType = value.value;
    });

    @action setDataSource = val => this.dataSource = val;

    @action
    onDrop = (accepted, rejected) => {
        const fileReader = new FileReader();
        const rABS = true;
        if (accepted.length > 0) {
            this.uploadMessage = '';
            const f = accepted[0];
            const fileName = f.name.split('.');
            const extension = fileName.pop();
            if (extension === 'csv') {
                this.setDataSource(1);
            } else {
                this.setDataSource(2);
            }
            fileReader.onloadstart = (this.onLoadStart);

            fileReader.onprogress = (this.onProgress);

            fileReader.onload = (ex) => {
                let data = ex.target.result;
                if (!rABS) {
                    data = new Uint8Array(data);
                }

                const workbook = XLSX.read(data, {
                    type: rABS ? 'binary' : 'array',
                    cellDates: true,
                    cellNF: false,
                    cellText: false
                });
                this.setWorkbook(workbook);

                const sheets = workbook.SheetNames.map(s => {
                    return {
                        label: s,
                        value: s
                    }
                });

                this.setSheets(sheets);

                if (sheets.length > 0) {
                    this.setSelectedSheet(sheets[0])
                }
            };
            if (rABS) {
                fileReader.readAsBinaryString(f);
            } else {
                fileReader.readAsArrayBuffer(f);
            }
            fileReader.onloadend = (this.onLoadEnd);
        } else if (rejected.length > 0) {
            NotificationManager.error('Only XLS, XLSX and CSV are supported', 'Error', 5000);
        }

    };


    @action
    pullData = async () => {
        let params = {};
        if (this.dateFilter !== '' && this.dateEndFilter !== '') {
            if (this.lastRun !== null) {
                params = {
                    ...params, ..._.fromPairs([[this.dateFilter, this.lastRun],
                        [this.dateEndFilter, moment(new Date()).format('YYYY-MM-DD HH:mm:ss')]])
                };
            }
        }
        if (this.url) {
            this.setPulling(true);
            try {
                const response = await axios.get(this.url, {
                    params
                });
                if (response.status === 200) {
                    let {data} = response;
                    this.setPulling(false);
                    this.setDataSource(3);
                    this.setPulledData(data);
                    await this.searchTrackedEntities();
                    this.setLastRun(moment(new Date()).format('YYYY-MM-DD HH:mm:ss'))
                } else {
                    this.setPulling(false);
                }
            } catch (e) {
                NotificationManager.error(e.message, 'Error', 5000);
                this.setPulling(false);
            }
        }
    };

    @action
    onProgress = ev => {
        this.uploaded = (ev.loaded * 100) / ev.total
    };

    @action
    onLoadStart = ev => {
        this.uploaded = 0
    };

    @action
    setPulling = val => this.pulling = val;

    @action
    onLoadEnd = ev => {
        this.uploaded = null
    };

    @action
    handleChangePage = (event, page) => this.page = page;

    @action
    handleChangeRowsPerPage = event => this.rowsPerPage = event.target.value;

    @action createSortHandler = property => event => {
        const orderBy = property;
        let order = 'desc';

        if (this.orderBy === property && this.order === 'desc') {
            order = 'asc';
        }
        this.setOrderBy(orderBy);
        this.setOrder(order);

    };

    @action setOrder = val => this.order = val;
    @action setOrderBy = val => this.orderBy = val;
    @action setOrganisationUnits = val => this.organisationUnits = val;
    @action setOrgUnitStrategy = val => this.orgUnitStrategy = val;
    @action setHeaderRow = val => this.headerRow = val;
    @action setDataStartRow = val => this.dataStartRow = val;
    @action setCreateNewEvents = val => this.createNewEvents = val;
    @action setCreateNewEnrollments = val => this.createNewEnrollments = val;
    @action setEventDateColumn = val => this.eventDateColumn = val;
    @action setEnrollmentDateColumn = val => this.enrollmentDateColumn = val;
    @action setIncidentDateColumn = val => this.incidentDateColumn = val;
    @action setUrl = val => this.url = val;
    @action setDateFilter = val => this.dateFilter = val;
    @action setDateEndFilter = val => this.dateEndFilter = val;
    @action setScheduleTime = val => this.scheduleTime = val;
    @action setLastRun = val => this.lastRun = val;
    @action setUploaded = val => this.uploaded = val;
    @action setUploadMessage = val => this.uploadMessage = val;
    @action setOrgUnitColumn = val => this.orgUnitColumn = val;
    @action setMappingId = val => this.mappingId = val;
    @action setErrors = val => this.errors = val;
    @action setConflicts = val => this.conflicts = val;
    @action setDuplicates = val => this.duplicates = val;
    @action setLongitudeColumn = val => this.longitudeColumn = val;
    @action setLatitudeColumn = val => this.latitudeColumn = val;
    @action setSelectedSheet = val => this.selectedSheet = val;
    @action setWorkbook = val => this.workbook = val;
    @action setSheets = val => this.sheets = val;
    @action setFetchingEntities = val => this.fetchingEntities = val;
    @action setPulledData = val => this.pulledData = val;
    @action setResponse = val => this.responses = [...this.responses, val];
    @action setDisplayProgress = val => this.displayProgress = val;
    @action setTrackedEntity = val => this.trackedEntity = val;
    @action setTrackedEntityType = val => this.trackedEntityType = val;
    @action setRunning = val => this.running = val;
    @action setUpdateEvents = val => this.updateEvents = val;
    @action setUpdateEnrollments = val => this.updateEnrollments = val;
    @action setCreateEntities = val => this.createEntities = val;
    @action setUpdateEntities = val => this.updateEntities = val;
    @action setTrackedEntityInstances = val => this.trackedEntityInstances = val;
    @action setPaging = val => this.paging = val;


    @action
    filterAttributes = attributesFilter => {
        attributesFilter = attributesFilter.toLowerCase();
        this.attributesFilter = attributesFilter;
    };

    @action
    searchTrackedEntities = async () => {
        let instances = [];
        const api = this.d2.Api.getApi();
        if (this.uniqueIds) {
            this.setFetchingEntities(1);
            const all = this.uniqueIds.map(uniqueId => {
                return api.get('trackedEntityInstances', {
                    paging: false,
                    ouMode: 'ALL',
                    filter: this.uniqueAttribute + ':IN:' + uniqueId,
                    fields: 'trackedEntityInstance'
                })
            });

            const results = await Promise.all(all);

            const ids = results.map(r => {
                const {trackedEntityInstances} = r;
                return trackedEntityInstances.map(t => {
                    return t.trackedEntityInstance;
                })
            });

            const entities = _.chunk(_.flatten(ids), 50).map(ids => ids.join(';'));

            const all1 = entities.map(entityGroup => {
                return api.get('trackedEntityInstances', {
                    paging: false,
                    trackedEntityInstance: entityGroup,
                    fields: 'trackedEntityInstance,orgUnit,attributes[attribute,value],enrollments[enrollment,program,' +
                        'trackedEntityInstance,trackedEntityType,trackedEntity,enrollmentDate,incidentDate,orgUnit,events[program,trackedEntityInstance,event,' +
                        'eventDate,status,completedDate,coordinate,programStage,orgUnit,dataValues[dataElement,value]]]'
                })
            });

            const results1 = await Promise.all(all1);

            for (let instance of results1) {
                const {trackedEntityInstances} = instance;
                instances = [...instances, ...trackedEntityInstances];
            }
            this.setTrackedEntityInstances(instances);
            this.setFetchingEntities(2);
        }
    };

    @action
    insertTrackedEntityInstance = (data) => {
        const api = this.d2.Api.getApi();
        return api.post('trackedEntityInstances', data, {});
    };

    @action
    updateTrackedEntityInstances = (trackedEntityInstances) => {
        const api = this.d2.Api.getApi();
        return trackedEntityInstances.map(trackedEntityInstance => {
            return api.update('trackedEntityInstances/' + trackedEntityInstance['trackedEntityInstance'], trackedEntityInstance, {});
        });
    };

    @action
    insertEnrollment = (data) => {
        const api = this.d2.Api.getApi();
        return api.post('enrollments', data, {});
    };

    @action
    insertEvent = (data) => {
        const api = this.d2.Api.getApi();
        return api.post('events', data, {});
    };

    @action
    updateDHISEvents = (eventsUpdate) => {
        const api = this.d2.Api.getApi();
        return eventsUpdate.map(event => {
            return api.update('events/' + event['event'], event, {});
        });

    };

    @action setResponses = val => {

        if (Array.isArray(val)) {
            this.responses = [...this.responses, ...val]
        } else {
            this.responses = [...this.responses, val]
        }
    };

    @action create = async () => {
        this.setDisplayProgress(true);
        const {newTrackedEntityInstances, newEnrollments, newEvents, trackedEntityInstancesUpdate, eventsUpdate} = this.processed;
        try {
            if (newTrackedEntityInstances.length > 0) {
                const instancesResults = await this.insertTrackedEntityInstance({
                    trackedEntityInstances: newTrackedEntityInstances
                });
                this.setResponses(instancesResults);
            }
        } catch (e) {
            this.setResponses(e);
        }

        try {
            if (trackedEntityInstancesUpdate.length > 0) {
                const instancesResults = await this.updateTrackedEntityInstances(trackedEntityInstancesUpdate);
                this.setResponses(instancesResults);
            }
        } catch (e) {
            this.setResponses(e);
        }

        try {
            if (newEnrollments.length > 0) {
                const enrollmentsResults = await this.insertEnrollment({
                    enrollments: newEnrollments
                });
                this.setResponses(enrollmentsResults);
            }
        } catch (e) {
            this.setResponses(e);
        }
        try {
            if (newEvents.length > 0) {
                const eventsResults = await this.insertEvent({
                    events: newEvents
                });
                this.setResponses(eventsResults);
            }
        } catch (e) {
            this.setResponses(e);
        }

        try {
            if (eventsUpdate.length > 0) {
                const eventsResults = await this.updateDHISEvents(eventsUpdate);
                console.log(JSON.stringify(eventsResults));
                this.setResponses(eventsResults);
            }
        } catch (e) {
            this.setResponses(e);
        }

        this.setDisplayProgress(false);
    };

    @action saveMapping = mappings => {
        const {conflicts, duplicates, errors} = this.processed;
        this.setConflicts(conflicts);
        this.setErrors(errors);
        this.setDuplicates(duplicates);
        const mapping = _.findIndex(mappings, {
            mappingId: this.mappingId
        });


        if (mapping !== -1) {
            mappings.splice(mapping, 1, this);
        } else {
            mappings = [...mappings, this]
        }

        const toBeSaved = mappings.map(p => {
            return p.canBeSaved;
        });

        this.d2.dataStore.get('bridge').then(action(namespace => {
            namespace.set('mappings', toBeSaved);
        }), this.fetchProgramsError);
    };

    @action deleteMapping = mappings => {
        const mapping = _.findIndex(mappings, {
            mappingId: this.mappingId
        });
        mappings.splice(mapping, 1);

        mappings = mappings.map(p => {
            return p.canBeSaved;
        });
        this.d2.dataStore.get('bridge').then(action(namespace => {
            namespace.set('mappings', mappings);
        }), this.fetchProgramsError);
    };

    @action.bound
    fetchProgramsError(error) {
        this.error = "error"
    }

    @action scheduleProgram = mappings => {
        if (this.scheduleTime !== 0) {
            setInterval(action(() => {
                if (this.running) {

                } else {
                    this.setRunning(true);
                    this.pullData();
                    this.create();
                    this.lastRun = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                    this.saveMapping(mappings);
                    this.setRunning(false);
                }
            }), this.scheduleTime * 60 * 1000);
        } else {
            console.log('Schedule time not set');
        }
    };


    @action runWhenURL = mappings => {
        this.setRunning(true);
        this.pullData();
        this.create();
        this.lastRun = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        this.saveMapping(mappings);
    };

    @action runWithFile = mappings => {
        if (this.scheduleTime !== 0) {
            setInterval(action(() => {
                if (!this.running) {
                    this.setRunning(true);
                    this.pullData();
                    this.create();
                    this.lastRun = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                    this.saveMapping(mappings);
                    this.setRunning(false);
                }
            }), this.scheduleTime * 60 * 1000);
        } else {
            console.log('Schedule time not set');
        }
    };

    @action loadDefaultAttributes = () => {
        if (this.createNewEnrollments) {
            this.programAttributes.forEach(pa => {
                const match = this.columns.find(column => {
                    return column.value === pa.trackedEntityAttribute.name;
                });

                if (match && !pa.column) {
                    pa.setColumn(match);
                }
            });
        }
    };

    @action loadDefaultDataElements = programStage => () => {
        if (this.createNewEvents || this.updateEvents) {
            programStage.dataElements.forEach(de => {
                const match = this.columns.find(column => {
                    return column.value === de.dataElement.name;
                });
                if (match && !de.column.value) {
                    de.setColumn(match);
                }
            });
        }
    };

    @computed
    get data() {
        if (this.workbook && this.selectedSheet) {
            return XLSX.utils.sheet_to_json(this.workbook.Sheets[this.selectedSheet.value], {
                range: this.headerRow - 1,
                dateNF: 'YYYY-MM-DD'
            });
        } else if (this.pulledData) {
            return this.pulledData
        }

        return [];
    }

    @computed
    get percentage() {
        return _.reduce(this.percentages, (memo, num) => {
            return memo + num
        }, 0);
    }

    @computed
    get columns() {
        if (this.workbook && this.selectedSheet) {
            const workSheet = this.workbook.Sheets[this.selectedSheet.value];
            const range = XLSX.utils.decode_range(workSheet['!ref']);
            return _.range(0, range.e.c + 1).map(v => {
                const cell = XLSX.utils.encode_cell({
                    r: this.headerRow - 1,
                    c: v
                });
                const cellValue = workSheet[cell];
                if (cellValue) {
                    return {
                        label: cellValue.v.toString(),
                        value: cellValue.v.toString()
                    };
                } else {
                    return {
                        label: '',
                        value: ''
                    };
                }
            }).filter(c => {
                return c.label !== '';
            });
        } else if (this.pulledData) {
            return _.keys(this.pulledData[0]).map(e => {
                return {
                    label: e,
                    value: e
                }
            });
        }
        return [];
    }


    /*@computed
    get running() {
        return !(this.percentage >= 100 || this.percentage === 0);
    }*/

    @computed
    get canBeSaved() {
        return _.pick(this,
            [
                'lastUpdated',
                'name',
                'id',
                'programType',
                'displayName',
                'programStages',
                'programTrackedEntityAttributes',
                'trackedEntityType',
                'trackedEntity',
                'mappingId',
                'orgUnitColumn',
                'orgUnitStrategy',
                'organisationUnits',
                'headerRow',
                'dataStartRow',
                'createNewEvents',
                'updateEvents',
                'createNewEnrollments',
                'createEntities',
                'updateEntities',
                'eventDateColumn',
                'enrollmentDateColumn',
                'incidentDateColumn',
                'scheduleTime',
                'url',
                'dateFilter',
                'dateEndFilter',
                'lastRun',
                'uploaded',
                'uploadMessage',
                // 'errors',
                // 'conflicts',
                // 'duplicates',
                // 'responses',
                'longitudeColumn',
                'latitudeColumn',
                'selectedSheet'
            ])
    }

    @computed
    get processedResponses() {
        let errors = [];
        let conflicts = [];
        let successes = [];

        this.responses.forEach(response => {
            if (response['httpStatusCode'] === 200) {
                const {importSummaries} = response['response'];

                if (importSummaries) {
                    importSummaries.forEach(importSummary => {
                        const {importCount, reference, href} = importSummary;
                        const url = this.getLocation(href);
                        const pathNames = url.pathname.split('/');
                        const type = pathNames.slice(-2, -1)[0];
                        successes = [...successes, {
                            ...importCount,
                            type,
                            reference
                        }];
                    });
                }
            } else if (response['httpStatusCode'] === 409) {
                _.forEach(response['response']['importSummaries'], (s) => {
                    _.forEach(s['conflicts'], (conflict) => {
                        conflicts = [...conflicts, {
                            ...conflict
                        }];
                    });
                    if (s['href']) {
                        successes = [...successes, {
                            href: s['href']
                        }];
                    }
                });
            } else if (response['httpStatusCode'] === 500) {
                errors = [...errors, {
                    ...response['error']
                }];
            }
        });
        return {
            errors,
            successes,
            conflicts
        }
    }


    @computed
    get isTracker() {
        return this.programType === 'WITH_REGISTRATION';
    }


    @computed
    get programAttributes() {
        const sorter = this.order === 'desc'
            ? (a, b) => (b[this.orderBy] < a[this.orderBy] ? -1 : 1)
            : (a, b) => (a[this.orderBy] < b[this.orderBy] ? -1 : 1);

        return this.programTrackedEntityAttributes.filter(item => {
            const displayName = item.trackedEntityAttribute.displayName.toLowerCase();
            return displayName.includes(this.attributesFilter)
        }).sort(sorter).slice(this.page * this.rowsPerPage, this.page * this.rowsPerPage + this.rowsPerPage);
    }

    @computed
    get allAttributes() {
        return this.programTrackedEntityAttributes.length;
    }


    @computed
    get uniqueAttribute() {
        const unique = this.programTrackedEntityAttributes.filter(a => {
            return a.trackedEntityAttribute.unique;
        });

        if (unique.length > 0) {
            return unique[0]['trackedEntityAttribute']['id'];
        }

        return null;

    }


    @computed
    get uniqueColumn() {
        const unique = this.programTrackedEntityAttributes.filter(a => {
            return a.trackedEntityAttribute.unique && a.column;
        });

        if (unique.length > 0) {
            return unique[0]['column']['value'];
        }

        return null;
    }

    @computed
    get uniqueIds() {
        if (this.uniqueColumn !== null && this.data && this.data.length > 0) {
            let foundIds = this.data.map(d => {
                return d[this.uniqueColumn];
            }).filter(c => {
                return c !== null && c !== undefined;
            });
            foundIds = _.uniq(foundIds);
            return _.chunk(foundIds, 50).map(ids => ids.join(';'));
        }
        return [];
    }

    @computed
    get searchedInstances() {
        const entities = this.trackedEntityInstances.map(e => {
            const uniqueAttribute = _.find(e.attributes, {
                attribute: this.uniqueAttribute
            });
            const val = uniqueAttribute ? uniqueAttribute['value'] : null;
            return {
                ...e,
                ..._.fromPairs([[this.uniqueAttribute, val]])
            }
        });
        return _.groupBy(entities, this.uniqueAttribute);
    }

    @computed
    get mandatoryAttributesMapped() {
        const allMandatory = this.programTrackedEntityAttributes.filter(item => {
            return item.mandatory && !item.column;
        });
        return allMandatory.length === 0;
    }

    @computed
    get compulsoryDataElements() {
        let compulsory = [];
        this.programStages.forEach(ps => {

            const pse = ps.programStageDataElements.filter(item => {
                return item.compulsory;
            }).map(e => {
                return e.dataElement.id
            });

            const me = ps.programStageDataElements.filter(item => {
                return item.compulsory && item.column && item.column.value;
            }).map(e => {
                return e.dataElement.id
            });

            let mapped = false;

            if (me.length === 0) {
                mapped = true;
            } else if (this.createNewEvents && pse.length > 0 && me.length > 0 && _.difference(pse, me).length === 0) {
                mapped = true;
            } else if (this.createNewEvents && pse.length > 0 && me.length > 0 && _.difference(pse, me).length > 0) {
                mapped = false;
            }
            compulsory = [...compulsory, {
                mapped
            }]
        });
        return _.every(compulsory, 'mapped');
    }


    @computed
    get processed() {
        let data = this.data;

        let eventsUpdate = [];
        let trackedEntityInstancesUpdate = [];

        let newEvents = [];
        let newEnrollments = [];
        let newTrackedEntityInstances = [];

        let duplicates = [];
        let conflicts = [];
        let errors = [];
        if (this.uniqueColumn) {
            data = data.filter(d => {
                return d[this.uniqueColumn] !== null && d[this.uniqueColumn] !== undefined;
            });
            let clients = _.groupBy(data, this.uniqueColumn);
            let newClients = [];
            _.forOwn(clients, (data, client) => {
                const previous = this.searchedInstances[client] || [];
                newClients = [...newClients, {
                    client,
                    data,
                    previous
                }];
            });
            data = newClients;
        } else if (data && data.length > 0) {
            data = data.map((data, i) => {
                return {
                    data: [data],
                    client: i + 1,
                    previous: []
                };
            });
        }

        if (data && data.length > 0) {
            data.forEach(client => {
                let events = [];
                let allAttributes = [];
                let currentData = client.data;
                let enrollmentDates = [];
                let orgUnits = [];
                let identifierElements = {};
                currentData.forEach(d => {
                    this.programStages.forEach(stage => {
                        let dataValues = [];
                        let eventDate;
                        if ((this.createNewEvents || this.updateEvents) && this.dataSource === 2) {
                            eventDate = d[this.eventDateColumn.value];
                        } else if (this.createNewEvents || this.updateEvents) {
                            const date = moment(d[this.eventDateColumn.value], 'YYYY-MM-DD');
                            if (date.isValid()) {
                                eventDate = date.format('YYYY-MM-DD');
                            }
                        }

                        const mapped = stage.programStageDataElements.filter(e => {
                            return e.column && e.column.value
                        });

                        identifierElements[stage.id] = {
                            elements: mapped.filter(e => {
                                return e.dataElement.identifiesEvent;
                            }).map(e => e.dataElement.id),
                            event: stage.eventDateIdentifiesEvent
                        };
                        // Coordinates
                        let coordinate = null;
                        if (stage.latitudeColumn && stage.longitudeColumn) {
                            coordinate = {
                                latitude: d[stage.latitudeColumn.value],
                                longitude: d[stage.longitudeColumn.value]
                            };
                        }
                        if (eventDate && mapped.length > 0) {
                            mapped.forEach(e => {
                                const value = d[e.column.value];
                                const type = e.dataElement.valueType;
                                const optionsSet = e.dataElement.optionSet;
                                const validatedValue = this.validateValue(type, value, optionsSet);

                                if (value !== '' && validatedValue !== null) {
                                    dataValues = [...dataValues, {
                                        dataElement: e.dataElement.id,
                                        value: validatedValue
                                    }];
                                } else if (value !== undefined) {
                                    conflicts = [...conflicts, {
                                        error: optionsSet === null ? 'Invalid value ' + value + ' for value type ' + type :
                                            'Invalid value: ' + value + ', expected: ' + _.map(optionsSet.options, o => {
                                                return o.code
                                            }).join(','),
                                        row: client.client,
                                        column: e.column.value
                                    }]
                                }
                            });

                            let event = {
                                dataValues,
                                eventDate,
                                programStage: stage.id,
                                program: this.id,
                                event: generateUid()
                            };

                            if (coordinate) {
                                event = {
                                    ...event,
                                    coordinate
                                }
                            }

                            if (stage.completeEvents) {
                                event = {
                                    ...event, ...{
                                        status: 'COMPLETED',
                                        completedDate: event['eventDate']
                                    }
                                }
                            }

                            events = [...events, event];
                        }
                    });

                    const mappedAttributes = this.programTrackedEntityAttributes.filter(a => {
                        return a.column && a.column.value
                    });

                    let attributes = [];

                    mappedAttributes.forEach(a => {
                        const value = d[a.column.value];
                        const type = a.valueType;
                        const optionsSet = a.trackedEntityAttribute.optionSet;
                        const validatedValue = this.validateValue(type, value, optionsSet);

                        if (value !== '' && validatedValue !== null) {
                            attributes = [...attributes, {
                                attribute: a.trackedEntityAttribute.id,
                                value: validatedValue
                            }]
                        } else if (value !== undefined) {
                            conflicts = [...conflicts, {
                                error: !optionsSet ? 'Invalid value ' + value + ' for value type ' + type :
                                    'Invalid value ' + value + ' choose from options: ' +
                                    _.map(optionsSet.options, o => o.code).join(','),
                                row: client.client,
                                column: a.column.value
                            }]
                        }

                    });

                    if (attributes.length > 0) {
                        allAttributes = [...allAttributes, attributes];
                    }

                    if (this.isTracker && this.enrollmentDateColumn && this.incidentDateColumn) {
                        const enrollmentDate = moment(d[this.enrollmentDateColumn.value], 'YYYY-MM-DD');
                        const incidentDate = moment(d[this.incidentDateColumn.value], 'YYYY-MM-DD');

                        if (enrollmentDate.isValid() && incidentDate.isValid()) {
                            enrollmentDates = [...enrollmentDates, {
                                enrollmentDate: enrollmentDate.format('YYYY-MM-DD'),
                                incidentDate: incidentDate.format('YYYY-MM-DD')
                            }]
                        }
                    }

                    if (this.orgUnitColumn !== '') {
                        orgUnits = [...orgUnits, d[this.orgUnitColumn.value]]
                    }
                });
                let groupedEvents = _.groupBy(events, 'programStage');

                if (client.previous.length > 1) {
                    duplicates = [...duplicates, client.previous]
                } else if (client.previous.length === 1) {
                    client.previous.forEach(p => {
                        let enrollments = p['enrollments'];
                        if (this.updateEntities) {
                            const nAttributes = _.differenceWith(allAttributes[0], p['attributes'], _.isEqual);
                            if (nAttributes.length > 0) {
                                const mergedAttributes = _.unionBy(allAttributes[0], p['attributes'], 'attribute');
                                let tei;

                                if (this.trackedEntityType && this.trackedEntityType.id) {
                                    tei = {
                                        ..._.pick(p, ['orgUnit', 'trackedEntityInstance', 'trackedEntityType']),
                                        attributes: mergedAttributes
                                    };
                                } else if (this.trackedEntity) {
                                    tei = {
                                        ..._.pick(p, ['orgUnit', 'trackedEntityInstance', 'trackedEntity']),
                                        attributes: mergedAttributes
                                    };
                                }
                                trackedEntityInstancesUpdate = [...trackedEntityInstancesUpdate, tei];
                            }
                        }
                        events = events.map(e => {
                            return {
                                ...e,
                                trackedEntityInstance: p['trackedEntityInstance'],
                                orgUnit: p['orgUnit']
                            }
                        });

                        groupedEvents = _.groupBy(events, 'programStage');
                        const enrollmentIndex = _.findIndex(enrollments, {
                            program: this.id
                        });
                        if (enrollmentIndex === -1 && this.createNewEnrollments && enrollmentDates.length > 0) {
                            let enroll = {
                                program: this.id,
                                orgUnit: p['orgUnit'],
                                trackedEntityInstance: p['trackedEntityInstance'],
                                ...enrollmentDates[0]
                            };
                            newEnrollments = [...newEnrollments, enroll];
                            if (this.createNewEvents) {
                                _.forOwn(groupedEvents, (evs, stage) => {
                                    const stageEventFilters = identifierElements[stage];
                                    const stageInfo = _.find(this.programStages, {
                                        id: stage
                                    });
                                    const {repeatable} = stageInfo;

                                    evs = this.removeDuplicates(evs, stageEventFilters);

                                    if (!repeatable) {
                                        const ev = _.maxBy(evs, 'eventDate');
                                        if (ev.dataValues.length > 0) {
                                            newEvents = [...newEvents, ev];
                                        }
                                    } else {
                                        newEvents = [...newEvents, ...evs];
                                    }
                                });
                            } else {
                                console.log('Ignoring not creating new events');
                            }
                            enrollments = [...enrollments, enroll];
                            p = {
                                ...p,
                                enrollments
                            }
                        } else if (enrollmentIndex === -1 && enrollmentDates.length === 0) {
                            console.log('Ignoring new enrollments');
                        } else if (enrollmentIndex !== -1) {
                            let enrollment = enrollments[enrollmentIndex];
                            let enrollmentEvents = enrollment['events'];
                            _.forOwn(groupedEvents, (evs, stage) => {
                                const stageInfo = _.find(this.programStages, {
                                    id: stage
                                });
                                const {repeatable} = stageInfo;

                                const stageEventFilters = identifierElements[stage];

                                evs = this.removeDuplicates(evs, stageEventFilters);

                                if (repeatable) {
                                    evs.forEach(e => {
                                        const eventIndex = this.searchEvent(enrollmentEvents, stageEventFilters, stage, e);
                                        if (eventIndex !== -1 && this.updateEvents) {
                                            const stageEvent = enrollmentEvents[eventIndex];
                                            const merged = _.unionBy(e['dataValues'], stageEvent['dataValues'], 'dataElement');
                                            const differingElements = _.differenceWith(e['dataValues'], stageEvent['dataValues'], _.isEqual);
                                            console.log(JSON.stringify(stageEvent));
                                            console.log(JSON.stringify(e));
                                            console.log(JSON.stringify(differingElements));
                                            console.log('----------------------------');
                                            if (merged.length > 0 && differingElements.length > 0) {
                                                const mergedEvent = {
                                                    ...stageEvent,
                                                    dataValues: merged
                                                };
                                                eventsUpdate = [...eventsUpdate, mergedEvent];
                                            }
                                        } else if (eventIndex === -1 && this.createNewEvents) {
                                            newEvents = [...newEvents, e];
                                        }
                                    });
                                } else {
                                    let foundEvent = _.find(enrollmentEvents, {
                                        programStage: stage
                                    });
                                    let max = _.maxBy(evs, 'eventDate');
                                    if (foundEvent && this.updateEvents) {
                                        const merged = _.unionBy(max['dataValues'], foundEvent['dataValues'], 'dataElement');
                                        const differingElements = _.differenceWith(max['dataValues'], foundEvent['dataValues'], _.isEqual);
                                        if (merged.length > 0 && differingElements.length > 0) {
                                            const mergedEvent = {
                                                ...foundEvent,
                                                dataValues: merged
                                            };
                                            eventsUpdate = [...eventsUpdate, mergedEvent];
                                        }
                                    } else if (!foundEvent && this.createNewEvents) {
                                        newEvents = [...newEvents, max];
                                    }
                                }
                            });
                        }
                    });
                } else {
                    orgUnits = _.uniq(orgUnits);
                    let orgUnit;
                    if (orgUnits.length > 1) {
                        errors = [...errors, {
                            error: 'Entity belongs to more than one organisation unit',
                            row: client.client
                        }]
                    } else if (orgUnits.length === 1) {
                        orgUnit = this.searchOrgUnit(orgUnits[0]);
                        if (orgUnit) {
                            if (enrollmentDates.length > 0 && this.isTracker && this.createNewEnrollments && this.createEntities) {
                                const trackedEntityInstance = generateUid();
                                let tei = {
                                    orgUnit: orgUnit.id,
                                    attributes: allAttributes[0],
                                    trackedEntityInstance
                                };

                                if (this.trackedEntityType && this.trackedEntityType.id) {
                                    tei = {
                                        ...tei,
                                        trackedEntityType: this.trackedEntityType.id
                                    }
                                } else if (this.trackedEntity && this.trackedEntity.id) {
                                    tei = {
                                        ...tei,
                                        trackedEntity: this.trackedEntity.id
                                    }
                                }

                                newTrackedEntityInstances = [...newTrackedEntityInstances, tei];

                                let enrollment = {
                                    orgUnit: orgUnit.id,
                                    program: this.id,
                                    trackedEntityInstance,
                                    ...enrollmentDates[0],
                                    enrollment: generateUid()
                                };

                                if (this.createNewEvents) {
                                    _.forOwn(groupedEvents, (evs, stage) => {
                                        const stageEventFilters = identifierElements[stage];
                                        const stageInfo = _.find(this.programStages, {
                                            id: stage
                                        });
                                        const {repeatable} = stageInfo;
                                        evs = evs.map(e => {
                                            return {
                                                ...e,
                                                orgUnit: orgUnit.id,
                                                event: generateUid(),
                                                trackedEntityInstance
                                            }
                                        });

                                        evs = this.removeDuplicates(evs, stageEventFilters);

                                        if (!repeatable) {
                                            newEvents = [...newEvents, _.maxBy(evs, 'eventDate')];
                                        } else {
                                            newEvents = [...newEvents, ...evs]
                                        }
                                    });
                                }
                                newEnrollments = [...newEnrollments, enrollment];
                            } else if (!this.isTracker && this.createNewEvents) {
                                events = events.map(e => {
                                    return {
                                        ...e,
                                        orgUnit: orgUnit.id
                                    }
                                });
                                newEvents = [...newEvents, ...events];
                            }
                        } else {
                            errors = [...errors, {
                                error: 'Organisation unit ' + orgUnits[0] + ' not found using strategy '
                                    + this.orgUnitStrategy.value,
                                row: client.client
                            }]
                        }
                    } else if (orgUnits.length === 0) {
                        errors = [...errors, {
                            error: 'Organisation unit missing',
                            row: client.client
                        }]
                    }
                }
            });
        }

        return {
            newTrackedEntityInstances,
            newEnrollments,
            newEvents,
            trackedEntityInstancesUpdate,
            eventsUpdate,
            conflicts,
            duplicates,
            errors
        }
    }

    removeDuplicates = (evs, stageEventFilters) => {
        if (stageEventFilters && stageEventFilters.elements && stageEventFilters.event) {
            evs = _.uniqBy(evs, v => {
                const filteredAndSame = stageEventFilters.elements.map(se => {
                    const foundPrevious = _.filter(v.dataValues, {
                        dataElement: se
                    });
                    if (foundPrevious.length > 0) {
                        const exists = foundPrevious[0].value;
                        return {
                            exists
                        };
                    } else {
                        return {
                            exists: false
                        }
                    }
                });

                if (_.some(filteredAndSame, {
                    'exists': false
                })) {
                    return v.event;
                } else {
                    return JSON.stringify([v.eventDate, filteredAndSame])
                }
            });

        } else if (stageEventFilters && stageEventFilters.elements) {

            evs = _.uniqBy(evs, v => {
                const filteredAndSame = stageEventFilters.elements.map(se => {
                    const foundPrevious = _.filter(v.dataValues, {
                        dataElement: se
                    });
                    if (foundPrevious.length > 0) {
                        const exists = foundPrevious[0].value;
                        return {
                            exists
                        };
                    } else {
                        return {
                            exists: false
                        }
                    }
                });

                if (_.some(filteredAndSame, {
                    'exists': false
                })) {
                    return v.event;
                } else {
                    return JSON.stringify([filteredAndSame])
                }
            });

        } else if (stageEventFilters && stageEventFilters.event) {
            evs = _.uniqBy(evs, v => {
                return v.eventDate;
            });
        }

        return evs;
    };

    searchEvent = (enrollmentEvents, stageEventFilters, stage, e) => {
        return _.findIndex(enrollmentEvents, item => {
            if (!stageEventFilters) {
                return false
            } else if (stageEventFilters.elements && stageEventFilters.event) {
                const filteredAndSame = stageEventFilters.elements.map(se => {
                    const foundPrevious = _.filter(item.dataValues, {
                        dataElement: se
                    });
                    const foundCurrent = _.filter(e.dataValues, {
                        dataElement: se
                    });
                    if (foundCurrent.length > 0 && foundPrevious.length > 0) {
                        const exists = foundPrevious[0].value === foundCurrent[0].value;
                        return {
                            exists
                        };
                    } else {
                        return {
                            exists: false
                        }
                    }
                });
                return item.programStage === stage &&
                    moment(item.eventDate, 'YYYY-MM-DD').format('YYYY-MM-DD') ===
                    moment(e.eventDate, 'YYYY-MM-DD').format('YYYY-MM-DD')
                    && _.every(filteredAndSame, 'exists');
            } else if (stageEventFilters.elements) {
                const filteredAndSame = stageEventFilters.elements.map(se => {
                    const foundPrevious = _.filter(item.dataValues, {
                        dataElement: se
                    });
                    const foundCurrent = _.filter(e.dataValues, {
                        dataElement: se
                    });
                    if (foundCurrent.length > 0 && foundPrevious > 0) {
                        return {
                            exists: foundPrevious[0].value === foundCurrent[0].value
                        };
                    } else {
                        return {
                            exists: false
                        }
                    }
                });

                return item.programStage === stage && _.every(filteredAndSame, 'exists')
            } else if (stageEventFilters.event) {
                return item.programStage === stage &&
                    moment(item.eventDate, 'YYYY-MM-DD').format('YYYY-MM-DD') ===
                    moment(e.eventDate, 'YYYY-MM-DD').format('YYYY-MM-DD')
            }
        });
    };


    @computed get currentNewInstances() {
        const {
            newTrackedEntityInstances
        } = this.processed;

        const info = this.paging['nte'];

        if (newTrackedEntityInstances && newTrackedEntityInstances.length > 0) {
            return newTrackedEntityInstances.slice(info.page * info.rowsPerPage, info.page * info.rowsPerPage + info.rowsPerPage);
        }
        return [];
    }

    @computed get currentNewEnrollments() {
        const {
            newEnrollments
        } = this.processed;

        const info = this.paging['nel'];

        if (newEnrollments && newEnrollments.length > 0) {
            return newEnrollments.slice(info.page * info.rowsPerPage, info.page * info.rowsPerPage + info.rowsPerPage);
        }
        return [];
    }

    @computed get currentNewEvents() {
        const {
            newEvents
        } = this.processed;

        const info = this.paging['nev'];

        if (newEvents && newEvents.length > 0) {
            return newEvents.slice(info.page * info.rowsPerPage, info.page * info.rowsPerPage + info.rowsPerPage);
        }
        return [];
    }

    @computed get currentInstanceUpdates() {
        const {
            trackedEntityInstancesUpdate
        } = this.processed;

        const info = this.paging['teu'];

        if (trackedEntityInstancesUpdate && trackedEntityInstancesUpdate.length > 0) {
            return trackedEntityInstancesUpdate.slice(info.page * info.rowsPerPage, info.page * info.rowsPerPage + info.rowsPerPage);
        }
        return [];
    }

    @computed get currentEventUpdates() {
        const {
            eventsUpdate
        } = this.processed;

        const info = this.paging['evu'];

        if (eventsUpdate && eventsUpdate.length > 0) {
            return eventsUpdate.slice(info.page * info.rowsPerPage, info.page * info.rowsPerPage + info.rowsPerPage);
        }
        return [];
    }

    @computed get currentErrors() {
        const {
            errors
        } = this.processed;

        const info = this.paging['err'];

        if (errors && errors.length > 0) {
            return errors.slice(info.page * info.rowsPerPage, info.page * info.rowsPerPage + info.rowsPerPage);
        }
        return [];
    }

    @computed get currentConflicts() {
        const {
            conflicts
        } = this.processed;

        const info = this.paging['con'];

        if (conflicts && conflicts.length > 0) {
            return conflicts.slice(info.page * info.rowsPerPage, info.page * info.rowsPerPage + info.rowsPerPage);
        }
        return [];
    }

    @computed get currentDuplicates() {
        const {
            duplicates
        } = this.processed;

        const info = this.paging['dup'];

        if (duplicates && duplicates.length > 0) {
            return duplicates.slice(info.page * info.rowsPerPage, info.page * info.rowsPerPage + info.rowsPerPage);
        }
        return [];
    }

    validText(dataType, value) {
        switch (dataType) {
            case 'TEXT':
            case 'LONG_TEXT':
                return value;
            case 'NUMBER':
                return !isNaN(value);
            case 'EMAIL':
                const re = /\S+@\S+\.\S+/;
                return re.test(String(value).toLowerCase());
            case 'BOOLEAN':
                return value === false || value === true;
            case 'TRUE_ONLY':
                return value + '' === true + '';
            case 'PERCENTAGE':
                return value >= 0 && value <= 100;
            case 'INTEGER':
                return !isNaN(value) && !isNaN(parseInt(value, 10));
            case 'DATE':
            case 'DATETIME':
            case 'TIME':
                return moment(value).isValid();
            case 'UNIT_INTERVAL':
                return value >= 0 && value <= 1;
            case 'INTEGER_NEGATIVE':
                return Number.isInteger(value) && value >= 0;
            case 'NEGATIVE_INTEGER':
                return Number.isInteger(value) && value < 0;
            case 'INTEGER_ZERO_OR_POSITIVE':
            case 'AGE':
                return Number.isInteger(value) && value >= 0;
            default:
                return true
        }
    }

    validateValue(dataType, value, optionSet) {
        if (optionSet) {
            const options = optionSet.options.map(o => {
                return {
                    code: o.code,
                    value: o.value
                }
            });
            const coded = _.find(options, o => {
                return value + '' === o.code + '' || value + '' === o.value + '';
            });
            if (coded !== undefined && coded !== null) {
                return coded.code;
            }
        } else if (this.validText(dataType, value)) {
            if (dataType === 'DATETIME') {
                return moment(value).format('YYYY-MM-DD HH:mm:ss');
            } else if (dataType === 'DATE') {
                return moment(value).format('YYYY-MM-DD');
            } else if (dataType === 'TIME') {
                return moment(value).format('HH:mm');
            }
            return value;
            /*const numeric = /^(-?0|-?[1-9]\d*)(\.\d+)?$/;
            const int = /^(0|-?[1-9]\d*)$/;
            const posInt = /^[1-9]\d*$/;
            const posOrZero = /(^0$)|(^[1-9]\d*$)/;
            const neg = /^-[1-9]\d*$/;*/
        }
        return null;
    }

    searchOrgUnit(val) {
        switch (this.orgUnitStrategy.value) {
            case 'uid':
                return _.find(this.organisationUnits, {
                    id: val
                });
            case 'code':
                return _.find(this.organisationUnits, {
                    code: val
                });
            case 'name':
                return _.find(this.organisationUnits, {
                    name: val
                });
            case 'auto':
                const s1 = _.find(this.organisationUnits, {
                    id: val
                });
                const s2 = _.find(this.organisationUnits, {
                    code: val
                });
                const s3 = _.find(this.organisationUnits, {
                    name: val
                });
                if (s1 !== undefined) {
                    return s1;
                } else if (s2 !== undefined) {
                    return s2;
                } else if (s3 !== undefined) {
                    return s3;
                } else {
                    return undefined;
                }
            default:
                return undefined;
        }
    }

    getLocation(href) {
        const match = href.match(/^(https?:)\/\/(([^:/?#]*)(?::([0-9]+))?)([/]?[^?#]*)(\?[^#]*|)(#.*|)$/);
        return match && {
            href: href,
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7]
        }
    }

}

export default Program;
