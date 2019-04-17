import {action, computed, observable} from "mobx";
import _ from 'lodash';
import XLSX from "xlsx";
import {encodeData, findAttributeCombo, nest, processMergedCells, enumerateDates} from "../utils";
import axios from "axios";
import alasql from 'alasql';
import {NotificationManager} from "react-notifications";
import Param from "./Param";

class DataSet {
    @observable id;
    @observable code;
    @observable name;
    @observable categoryCombo;
    @observable forms = [];

    @observable aggregateId = 1;


    @observable selectedSheet;
    @observable sheets = [];
    @observable workbook;
    @observable workSheet;

    @observable orgUnitColumn;
    @observable periodColumn;
    @observable dataStartColumn;
    @observable orgUnitStrategy;

    @observable organisationUnits;

    @observable periodInExcel = false;
    @observable organisationUnitInExcel = false;
    @observable attributeCombosInExcel = false;

    @observable dataElementColumn;
    @observable categoryOptionComboColumn;
    @observable dataValueColumn;

    @observable headerRow = 1;
    @observable dataStartRow = 2;

    @observable uploadMessage = '';
    @observable uploaded = 0;

    @observable page = 0;
    @observable rowsPerPage = 10;

    @observable params = [];

    @observable isDhis2 = false;
    @observable dhis2DataSets = [];
    @observable dhis2DataSet;

    @observable d2;

    @observable mapping;

    @observable currentData;

    @observable dataValues;

    @observable periodType;

    @observable period;
    @observable displayProgress = false;
    @observable displayDhis2Progress = false;

    @observable organisation;
    @observable organisationColumn;
    @observable periodCell;
    @observable organisationCell;
    @observable url = '';
    @observable pulledData = null;
    @observable responses = [];
    @observable cell2 = {};

    @observable pullingErrors = [];

    @observable username = '';

    @observable password = '';

    @observable pulling = false;
    @observable templateType = "1";

    @observable responseKey = '';

    @observable dialogOpen = false;
    @observable levels = [];
    @observable currentLevel;
    @observable selectedDataSet;
    @observable template = 0;
    @observable fileName;

    @observable mappingName;
    @observable mappingDescription;
    @observable completeDataSet = true;
    @observable multiplePeriods = false;

    @observable startPeriod = '2017-05-24';
    @observable endPeriod = '2017-05-24';

    @action setDialogOpen = val => this.dialogOpen = val;
    @action openDialog = () => this.setDialogOpen(true);
    @action closeDialog = () => this.setDialogOpen(false);

    @action
    setD2 = (d2) => {
        this.d2 = d2;
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
    onLoadEnd = ev => {
        this.uploaded = null
    };

    @action
    pick = (val) => {
        this.period = val;
    };


    @action setId = val => this.id = val;
    @action setName = val => this.name = val;
    @action setCode = val => this.code = val;
    @action setForms = val => this.forms = val;
    @action setCategoryCombo = val => this.categoryCombo = val;
    @action setMapping = val => this.mapping = val;
    @action setDataValues = val => this.dataValues = val;
    @action setTemplateType = val => this.templateType = val;
    @action setFileName = val => this.fileName = val;


    @action setSelectedSheet = val => {
        this.selectedSheet = val;
        if (val && this.workbook) {
            this.setWorkSheet(this.workbook.Sheets[val.value]);
        }
    };

    @action setWorkbook = val => this.workbook = val;
    @action setSheets = val => this.sheets = val;
    @action setDataSets = val => this.dataSets = val;

    @action setOrgUnitColumn = val => this.orgUnitColumn = val;
    @action setOrgUnitStrategy = val => this.orgUnitStrategy = val;
    @action setPeriodColumn = val => this.periodColumn = val;
    @action setDataStartColumn = val => this.dataStartColumn = val;
    @action setDataElementColumn = val => this.dataElementColumn = val;
    @action setCategoryOptionComboColumn = val => this.categoryOptionComboColumn = val;
    @action setDataValueColumn = val => this.dataValueColumn = val;
    @action setHeaderRow = val => this.headerRow = val;
    @action setDataStartRow = val => this.dataStartRow = val;
    @action setOrganisationUnits = val => this.organisationUnits = val;
    @action setPeriodType = val => this.periodType = val;
    @action setOrganisation = val => this.organisation = val;
    @action setOrganisationCell = val => this.organisationCell = val;
    @action setWorkSheet = val => this.workSheet = val;
    @action setPeriod = val => this.period = val;
    @action setCompleteDataSet = val => this.completeDataSet = val;
    @action handelURLChange = value => {
        this.url = value;
        if (this.url !== '') {
            this.setTemplate(2);
        } else {
            this.setTemplate(0);
        }
    };
    @action setDisplayProgress = val => this.displayProgress = val;
    @action setDisplayDhis2Progress = val => this.displayDhis2Progress = val;
    @action setPulledData = val => this.pulledData = val;
    @action setUrl = val => this.url = val;
    @action setAggregateId = val => this.aggregateId = val;
    @action setOrganisationColumn = val => this.organisationColumn = val;
    @action setCell2 = val => this.cell2 = val;
    @action setPulling = val => this.pulling = val;
    @action setUsername = val => this.username = val;
    @action setDhis2DataSets = val => this.dhis2DataSets = val;
    @action setIsDhis2 = val => this.isDhis2 = val;
    @action setLevels = val => this.levels = val;
    @action setPassword = val => this.password = val;
    @action setResponseKey = val => this.responseKey = val;
    @action setCurrentLevel = val => this.currentLevel = val;
    @action addPullingError = val => this.pullingErrors = [...this.pullingErrors, val];
    @action setParams = val => this.params = val;
    @action setMappingName = val => this.mappingName = val;
    @action setMappingDescription = val => this.mappingDescription = val;

    @action setStartPeriod = val => this.startPeriod = val;
    @action setEndPeriod = val => this.endPeriod = val;

    @action handleRadioChange = event => {
        this.setTemplateType(event.target.value);
        if (this.templateType !== '2') {
            this.periodInExcel = false;
            this.organisationUnitInExcel = false;
            this.attributeCombosInExcel = false;
        }
    };

    @action handleStartPeriodChange = event => {
        this.setStartPeriod(event.target.value)
    };

    @action handleEndPeriodChange = event => {
        this.setEndPeriod(event.target.value)
    };


    @action addParam = () => {
        this.params = [...this.params, new Param()]
    };

    @action addParam2 = param => {
        this.params = [...this.params, param]
    };

    @action replaceParam = (p) => {

        const foundParam = _.findIndex(this.params, {
            param: p.param
        });


        if (foundParam !== -1) {
            this.params.splice(foundParam, 1, p);
        } else {
            this.params = [...this.params, p]
        }
    };

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

    @action setDhis2DataSet = val => this.dhis2DataSet = val;

    @action setDhis2DataSetChange = async val => {
        this.selectedDataSet = val;
        if (val && val.value) {
            const p = new Param();
            p.setParam('dataSet');
            p.setValue(val.value);
            this.replaceParam(p);
            const urlBase = this.getDHIS2Url();
            const url = `${urlBase}/dataSets/${val.value}.json`;
            const dataSet = await this.callAxios(url, {
                paging: false,
                fields: 'id,name,code,periodType,dataSetElements[dataElement[id,name,code,valueType,categoryCombo[id,name,categoryOptionCombos[id,name]]]]'
            });
            this.setDhis2DataSet(dataSet);
        }
    };

    @action loadLevelsAndDataSets = async () => {
        const urlBase = this.getDHIS2Url();
        if (urlBase) {
            const dataSetUrl = urlBase + '/dataSets.json';
            const orgUnitLevelUrl = urlBase + '/organisationUnitLevels.json';

            const levelResponse = await this.callAxios(orgUnitLevelUrl, {
                paging: false,
                fields: 'name,level'
            });

            if (levelResponse) {
                const levels = levelResponse.organisationUnitLevels.map(l => {
                    return {label: l.name, value: l.level}
                });

                this.setLevels(levels);
            }

            const data = await this.callAxios(dataSetUrl, {
                paging: false,
                fields: 'id,name'
            });

            if (data) {
                const dataSets = data.dataSets.map(d => {
                    return {label: d.name, value: d.id};
                });
                this.setDhis2DataSets(dataSets);
            }
        }

    };

    getDHIS2Url = () => {
        if (this.isDhis2 && this.url !== '' && this.username !== '' && this.password !== '') {
            const url = new URL(this.url);
            const dataURL = url.pathname.split('/');
            const apiIndex = dataURL.indexOf('api');

            let sliced = [];
            if (apiIndex !== -1) {
                sliced = dataURL.slice(0, apiIndex + 1);
            } else {
                if (dataURL[dataURL.length - 1] === "") {
                    sliced = [...dataURL.slice(0, dataURL.length - 1), 'api']
                } else {
                    sliced = [...dataURL, 'api']
                }
            }

            return url.origin + sliced.join('/');
        }

        return null
    };

    pullOrganisationUnits = async () => {

        const baseUrl = this.getDHIS2Url();
        if (baseUrl) {
            const url = baseUrl + '/organisationUnits.json';
            const data = await this.callAxios(url, {level: this.currentLevel.value});
            if (data) {
                return data.organisationUnits;
            }
        }

        return [];
    };

    callAxios = async (url, params) => {
        try {
            const levelResponse = await axios.get(url, {
                params,
                withCredentials: true,
                auth: {
                    username: this.username,
                    password: this.password
                }
            });

            return levelResponse.data;
        } catch (e) {
            NotificationManager.error(`Could not fetch data from ${url} ${JSON.stringify(e)}`);
            return null;
        }

    };

    @action setTemplate = val => this.template = val;

    @action onCheckCompleteDataSet = async event => {
        this.completeDataSet = event.target.checked;
    };

    @action onCheckMultiplePeriods = async event => {
        this.multiplePeriods = event.target.checked;
    };

    @action onCheckIsDhis2 = async event => {
        this.isDhis2 = event.target.checked;
        const urlBase = this.getDHIS2Url();
        if (urlBase) {
            this.openDialog();
            await this.loadLevelsAndDataSets();
            this.setDataElementColumn({label: 'dataElement', value: 'dataElement'});
            this.setCategoryOptionComboColumn({label: 'categoryOptionCombo', value: 'categoryOptionCombo'});
            this.setPeriodColumn({label: 'period', value: 'period'});
            this.setDataValueColumn({label: 'value', value: 'value'});

            const p1 = new Param();
            p1.setParam('dataElementIdScheme');
            p1.setValue('NAME');

            const p2 = new Param();
            p2.setParam('orgUnitIdScheme');
            p2.setValue('NAME');

            const p3 = new Param();
            p3.setParam('includeDeleted');
            p3.setValue(false);

            const p4 = new Param();
            p4.setParam('children');
            p4.setValue(true);

            const p5 = new Param();
            p5.setParam('categoryOptionComboIdScheme');
            p5.setValue('NAME');

            this.replaceParam(p1);
            this.replaceParam(p2);
            this.replaceParam(p3);
            this.replaceParam(p4);
            this.replaceParam(p5);

            this.setOrgUnitStrategy({label: 'name', value: 'name'});
            this.setOrgUnitColumn({label: 'orgUnit', value: 'orgUnit'});

            this.closeDialog();

        } else {
            this.setLevels([]);
            this.setDhis2DataSet(null);
            this.setDhis2DataSets([]);
        }

    };

    @action
    onDrop = (accepted, rejected) => {
        const fileReader = new FileReader();
        const rABS = true;
        if (accepted.length > 0) {
            this.uploadMessage = '';
            const f = accepted[0];
            this.setFileName(f.name);
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
                    return {label: s, value: s}
                });

                if (sheets.length > 0) {
                    this.setSelectedSheet(sheets[0]);
                    this.setWorkSheet(this.workbook.Sheets[this.selectedSheet.value]);
                }
                this.setSheets(sheets);
                this.setTemplate(1);

            };
            if (rABS) {
                fileReader.readAsBinaryString(f);
            } else {
                fileReader.readAsArrayBuffer(f);
            }
            fileReader.onloadend = (this.onLoadEnd);
        } else if (rejected.length > 0) {
            this.uploadMessage = 'Only XLS, XLSX are supported'
        }

    };

    @action setCurrentData = val => this.currentData = val;

    @action setDefaults = () => {
        this.forms.forEach(form => {
            form.dataElements.forEach(de => {
                const mapping = this.uniqueDataElements.find(u => {
                    return u.value === de.name || u.value === de.code;
                });

                if (mapping && !de.mapping) {
                    de.mapping = mapping;
                }
            });

            form.categoryOptionCombos.forEach(coc => {
                _.keys(coc.mapping).forEach(k => {
                    const search = form.dataElements.find(de => de.id === k);
                    if (search && search.mapping) {
                        search.handelMappingChange(this.data, this.categoryOptionComboColumn, this.isDhis2)(search.mapping);
                        if (this.isDhis2) {
                            if (this.dhis2DataSet) {
                                const found = this.dhis2DataSet.dataSetElements.find(dde => {
                                    return dde.dataElement.id === search.id;
                                });

                                if (found) {
                                    const cocs = found.dataElement.categoryCombo.categoryOptionCombos.map(coc => {
                                        return {label: coc.name, value: coc.name}
                                    });
                                    search.setUniqueCategoryOptionCombos(cocs);
                                } else {
                                    search.setUniqueCategoryOptionCombos([])
                                }
                            }
                        }
                        const match = search.uniqueCategoryOptionCombos.find(ucoc => coc.name === ucoc.value);
                        if (match) {
                            coc.mapping[k] = match;
                        }
                    }
                });
            });
        });
    };

    @action
    handleCreateNewEventsCheck = event => {
        this.createNewEvents = event.target.checked;

        if (!this.createNewEvents) {
            this.eventDateColumn = null;
        }
    };


    @action handlePeriodInExcel = event => {
        this.periodInExcel = event.target.checked;
    };

    @action handleOrganisationInExcel = event => {
        this.organisationUnitInExcel = event.target.checked;

        if (this.organisationUnitInExcel && this.cells.length > 0) {
            this.organisationCell = this.cells[0];
            this.organisation = null;
        } else if (this.organisationUnitInExcel) {
            this.organisationCell = null;
            this.organisation = null;
        }

        if (!this.organisationUnitInExcel) {
            this.organisation = this.organisations[0];
            this.organisationCell = null;
        }
    };


    @action handleAttributeCombosInExcel = event => {
        this.attributeCombosInExcel = event.target.checked;
    };

    @action saveAggregate = async aggregates => {

        const dataSetIndex = _.findIndex(aggregates, agg => {
            return agg.aggregateId === this.aggregateId
        });


        if (dataSetIndex !== -1) {
            aggregates.splice(dataSetIndex, 1, this);
        } else {
            aggregates = [...aggregates, this]
        }

        const toBeSaved = aggregates.map(p => {
            return p.canBeSaved;
        });

        try {
            const namespace = await this.d2.dataStore.get('bridge');
            namespace.set('aggregates', toBeSaved);
            NotificationManager.info(`Mapping saved successfully`, 'Success', 5000);
        } catch (e) {
            NotificationManager.error(`Could not save to data store ${JSON.stringify(e)}`, 'Error', 5000);
        }
    };

    @action
    pullData = async () => {
        this.setPulledData(null);
        let param = '';

        if (this.params.length > 0) {
            param = encodeData(this.params);
        }

        if (this.url !== '') {
            try {
                let response;
                if (this.username !== '' && this.password !== '') {
                    this.setPulling(true);
                    let url = this.url;

                    if (this.isDhis2) {
                        url = this.getDHIS2Url() + '/dataValueSets.json'
                    }

                    response = await axios.get(url + '?' + param, {
                        params: {},
                        withCredentials: true,
                        auth: {
                            username: this.username,
                            password: this.password
                        }
                    });
                } else {
                    this.setPulling(true);
                    response = await axios.get(this.url + '?' + param);
                }

                if (response.status === 200) {
                    const {data} = response;
                    if (this.responseKey && this.responseKey !== '') {
                        this.setPulledData(data[this.responseKey]);
                    } else {
                        this.setPulledData(data);
                    }

                    this.setPulling(false)
                }
            } catch (e) {
                this.addPullingError(e.response.data);
                // NotificationManager.error(e.message, 'Error', 5000);
                this.setPulling(false);

                NotificationManager.error(`Could not pull data ${JSON.stringify(e)}`, 'Error', 5000);
            }
        }
    };

    @action
    insertDataValues = (data) => {
        const api = this.d2.Api.getApi();
        return api.post('dataValueSets', data, {});
    };

    @action destroy = () => {
        this.setPulledData(null);
        this.setWorkSheet(null);
        this.setWorkbook(null);
        this.setSelectedSheet(null);
    };

    @action completeDataSets = () => {
        const api = this.d2.Api.getApi();
        return api.post('completeDataSetRegistrations', {completeDataSetRegistrations: this.whatToComplete}, {});
    };

    @action create1 = () => {
        try {
            if (this.processed && this.processed.length > 0) {
                return this.insertDataValues({dataValues: this.processed});
            }
        } catch (e) {
            this.setResponses(e);
            NotificationManager.error(`Could not insert values ${JSON.stringify(e)}`, 'Error', 5000);
        }
    };


    @action create = async () => {
        this.setDisplayProgress(true);
        this.openDialog();
        try {
            if (this.isDhis2) {
                if (this.dhis2DataSet) {
                    const orgUnits = await this.pullOrganisationUnits();
                    const param = new Param();
                    param.setParam('orgUnit');
                    if (this.multiplePeriods) {

                        if (this.startPeriod && this.endPeriod && this.addition && this.additionFormat) {
                            const periods = enumerateDates(this.startPeriod, this.endPeriod, this.addition, this.additionFormat);
                            const pp = new Param();
                            pp.setParam('period');
                            for (const p of periods) {
                                pp.setValue(p);
                                this.replaceParam(pp);
                                const all = orgUnits.map(ou => {
                                    param.setValue(ou.id);
                                    this.replaceParam(param);
                                    return this.pullData().then(data => {
                                        return this.create1();
                                    });
                                });
                                const results = await Promise.all(all);
                                const filtered = results.filter(r => {
                                    return r
                                });
                                await this.completeDataSets();
                                this.destroy();
                                this.setResponses(filtered);
                            }

                        } else {
                            NotificationManager.warning('Either period type not supported or start and end date not provided', 'Warning');
                        }
                    } else {
                        const all = orgUnits.map(ou => {
                            param.setValue(ou.id);
                            this.replaceParam(param);
                            return this.pullData().then(data => {
                                return this.create1();
                            });
                        });

                        const results = await Promise.all(all);
                        const filtered = results.filter(r => {
                            return r
                        });

                        await this.completeDataSets();
                        this.destroy();
                        this.setResponses(filtered);
                    }


                }
            } else {
                const results = await this.create1();
                await this.completeDataSets();
                this.destroy();
                this.setResponses(results);
            }
        } catch (e) {
            this.setResponses(e);
        }
        this.setDisplayProgress(false);
        this.closeDialog();

        const {importCount, conflicts} = this.processedResponses;
        NotificationManager.success(`${importCount.imported}`, 'Imported');
        NotificationManager.success(`${importCount.deleted}`, 'Deleted');
        NotificationManager.success(`${importCount.updated}`, 'Updated');

        if (importCount.ignored > 0) {
            NotificationManager.warning(`${importCount['ignored']}`, 'Ignored');
        }

        if (this.pullingErrors.length > 0) {
            const vals = _.groupBy(this.pullingErrors, 'message');
            _.forOwn(vals, (val, key) => {
                NotificationManager.error(`${key}`, `Error - Affected ${val.length}`, 10000);
            })
        }
        _.uniqBy(conflicts, 'message').forEach(s => {
            NotificationManager.error(`${s.message}`, 'Error');
        });

    };

    @action setResponses = val => {
        if (Array.isArray(val)) {
            this.responses = [...this.responses, ...val]
        } else {
            this.responses = [...this.responses, val]
        }
    };

    @action removeParam = i => () => {
        const current = [...this.params.slice(0, i), ...this.params.slice(i + 1)];
        this.setParams(current);
    };

    @action deleteAggregate = async aggregates => {
        const mapping = _.findIndex(aggregates, {aggregateId: this.aggregateId});
        aggregates.splice(mapping, 1);

        aggregates = aggregates.map(p => {
            return p.canBeSaved;
        });

        try {
            const namespace = await this.d2.dataStore.get('bridge');
            await namespace.set('aggregates', aggregates);
        } catch (e) {
            NotificationManager.error(`Could not delete aggregate mapping ${JSON.stringify(e)}`, 'Error', 5000);
        }
    };

    @action setMappingAll2 = de => val => {
        if (val && val.value) {
            let value = val.value;
            value = {...value, column: de.column};
            val = {
                ...val,
                value
            };
            const obj = _.fromPairs([[de.name, val]]);
            const c = {...this.cell2, ...obj};
            this.setCell2(c);
        } else {
            const final = _.omit(this.cell2, [de.name]);
            this.setCell2(final);
        }
    };

    @action loadSame = () => {
        let maps = {};

        this.allCategoryOptionCombos.forEach(coc => {
            const match = this.mergedCellsWithDataElementRow.find(cell => {
                return cell.name === coc.label;
            });

            if (match) {
                let value = coc.value;
                value = {...value, column: match.column};
                coc = {
                    ...coc,
                    value
                };
                const obj = _.fromPairs([[coc.label, coc]]);
                maps = {...maps, ...obj};
            }
        });
        maps = {...maps, ...this.cell2};
        this.setCell2(maps);
    };

    @action
    handleChangePage = (event, page) => this.page = page;

    @action
    handleChangeRowsPerPage = event => this.rowsPerPage = event.target.value;

    @action
    handleMappingNameChange = value => {
        this.mappingName = value;
    };

    @action
    handleMappingDescriptionChange = value => {
        this.mappingDescription = value;
    };

    @computed get processedResponses() {
        let errors = [];
        let conflicts = [];

        let updatedTotal = 0;
        let deletedTotal = 0;
        let importedTotal = 0;
        let ignoredTotal = 0;

        this.responses.forEach(response => {
            if (response['status'] === 'SUCCESS' || response['status'] === 'WARNING') {
                const {imported, deleted, updated, ignored} = response['importCount'];
                if (imported) {
                    importedTotal = importedTotal + imported
                }

                if (deleted) {
                    deletedTotal = deletedTotal + deleted
                }

                if (updated) {
                    updatedTotal = updatedTotal + updated
                }

                if (ignored) {
                    ignoredTotal = ignoredTotal + ignored
                }

                if (response['conflicts']) {
                    conflicts = [...conflicts, ...response['conflicts']]
                }
            } else if (response['httpStatusCode'] === 500) {
                errors = [...errors, {...response['error']}];
            }
        });
        const importCount = {
            deleted: deletedTotal,
            imported: importedTotal,
            updated: updatedTotal,
            ignored: ignoredTotal
        };
        return {errors, importCount, conflicts}
    }


    @computed get columns() {
        if (this.workSheet) {
            const range = XLSX.utils.decode_range(this.workSheet['!ref']);
            return _.range(0, range.e.c + 1).map(v => {
                const cell = XLSX.utils.encode_cell({r: this.headerRow - 1, c: v});
                const cellValue = this.workSheet[cell];
                if (cellValue) {
                    return {label: cellValue.v.toString(), value: cellValue.v.toString()};
                } else {
                    return {label: '', value: ''};
                }
            }).filter(c => {
                return c.label !== '';
            });
        } else if (this.pulledData) {
            return _.keys(this.pulledData[0]).map(e => {
                return {label: e, value: e}
            });
        }

        return [];
    }

    @computed get mergedCells() {
        return this.workSheet['!merges'] || [];
    }

    @computed get mergedCellsWithDataElementRow() {
        let processed = [];
        this.mergedCells.filter(e => {
            return e.s.r === this.headerRow - 1
        }).sort().forEach(val => {
            const cell_address = {c: val.s.c, r: val.s.r};
            const cell_ref = XLSX.utils.encode_cell(cell_address);

            const dataElement = this.data[cell_ref]['v'];

            processed = processMergedCells(this.mergedCells, this.data, val, processed, dataElement);
        });

        const others = this.cellColumns.map(col => {
            const cell = col.value + this.headerRow;
            const name = this.data[cell];
            return {name: name ? name['v'] : null, column: col.value};
        }).filter(d => {
            const match = processed.find(p => {
                return p.column === d.column;
            });
            return d.name !== null && d.column > this.dataStartColumn.value && !match;
        });

        processed = [...processed, ...others];

        const sorter = (a, b) => (a['name'] < b['name'] ? -1 : 1);

        return processed.sort(sorter);
    }

    @computed get processedDhis2DataSets() {
        return this.dhis2DataSets.map(ds => {
            return {label: ds.name, value: ds}
        });
    }

    @computed get cells() {
        let foundCells = [];
        if (this.workSheet) {
            const range = XLSX.utils.decode_range(this.workSheet['!ref']);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cell_address = {c: C, r: R};
                    const cell_ref = XLSX.utils.encode_cell(cell_address);

                    foundCells = [...foundCells, {label: cell_ref, value: cell_ref}];
                }
            }
        }
        return foundCells;
    }


    @computed get rows() {
        if (this.workSheet) {
            const range = XLSX.utils.decode_range(this.workSheet['!ref']);
            return _.range(this.dataStartRow, range.e.r + 2)
        }
        return [];
    }

    @computed get cellColumns() {
        if (this.workSheet) {
            const range = XLSX.utils.decode_range(this.workSheet['!ref']);
            return _.range(0, range.e.c + 1).map(v => {
                const cell_ref = XLSX.utils.encode_col(v);
                return {label: cell_ref, value: cell_ref}
            });
        }

        return [];
    }


    @computed get data() {
        if (this.workSheet) {
            if (this.templateType === '1' && this.dataElementColumn) {
                const data = XLSX.utils.sheet_to_json(this.workSheet, {
                    range: this.headerRow - 1,
                    dateNF: 'YYYY-MM-DD'
                });
                return nest(data, [this.dataElementColumn.value]);
            } else if (this.cells.length > 0) {
                return _.fromPairs(this.cells.map(c => {
                    return [c.value, this.workSheet[c.value]]
                }));
            }
        } else if (this.pulledData && this.dataElementColumn) {
            return nest(this.pulledData, [this.dataElementColumn.value]);
        }
        return [];
    }

    @computed get allCategoryOptionCombos() {
        let cocs = [];
        this.forms.forEach(f => {
            f.dataElements.forEach(de => {
                f.categoryOptionCombos.forEach(coc => {
                    cocs = [...cocs, {
                        label: de.name + ': ' + coc.name,
                        value: {dataElement: de.id, categoryOptionCombo: coc.id}
                    }]
                });
            });
        });

        return cocs;
    }

    @computed get allAttributesMapped() {
        const mappings = this.categoryCombo.categories.map(c => {
            return !!c
        });
        return _.every(mappings);
    }

    @computed get processed() {
        let data = this.data;
        let dataValues = [];

        let dataSetUnits;

        if (this.orgUnitStrategy) {
            dataSetUnits = _.fromPairs(this.organisationUnits.map(o => {
                if (this.orgUnitStrategy && this.orgUnitStrategy.value === 'name') {
                    return [o.name.toLowerCase(), o.id];
                } else if (this.orgUnitStrategy && this.orgUnitStrategy.value === 'code') {
                    return [o.code, o.id];
                }
                return [o.id, o.id];

            }));
        }
        if (this.templateType !== '4') {
            const forms = this.forms;
            forms.forEach(f => {
                if (this.templateType === '1') {

                    let validatedData = [];
                    f.dataElements.forEach(element => {
                        if (element.mapping) {
                            const foundData = data[element.mapping.value];
                            if (foundData) {
                                const groupedData = foundData.map(d => {

                                    const rowData = this.categoryCombo.categories.map(category => {
                                        const optionColumn = category.mapping.value;
                                        return d[optionColumn]
                                    });

                                    return {
                                        period: d[this.periodColumn.value],
                                        value: d[this.dataValueColumn.value],
                                        orgUnit: d[this.orgUnitColumn.value] ? d[this.orgUnitColumn.value].toLocaleLowerCase() : null,
                                        dataElement: element.id,
                                        attributeValue: rowData,
                                        categoryOptionCombo: d[this.categoryOptionComboColumn.value] ? d[this.categoryOptionComboColumn.value].toLocaleLowerCase() : null
                                    }
                                });
                                validatedData = [...validatedData, ...groupedData];
                            }
                        }
                    });
                    data = validatedData;
                }
                if (data) {
                    f.categoryOptionCombos.forEach(coc => {
                        if (this.templateType === '1') {
                            // f.categoryOptionCombos.forEach(coc => {
                            _.forOwn(coc.mapping, (mapping, dataElement) => {
                                const filtered = data.filter(v => {
                                    return mapping && mapping.value && v.categoryOptionCombo === mapping.value.toLocaleLowerCase() && v.dataElement === dataElement;
                                });
                                filtered.forEach(d => {
                                    const attribute = findAttributeCombo(this, d.attributeValue, false);
                                    if (d['orgUnit'] && attribute) {
                                        const orgUnit = dataSetUnits[d['orgUnit']];
                                        if (orgUnit) {
                                            dataValues = [...dataValues, {
                                                dataElement,
                                                value: d['value'],
                                                period: d['period'],
                                                attributeOptionCombo: attribute.id,
                                                categoryOptionCombo: coc.id,
                                                orgUnit
                                            }];
                                        }
                                    }
                                });
                            });
                            // });
                        } else if (this.templateType === '2') {
                            _.forOwn(coc.cell, (mapping, dataElement) => {
                                let orgUnit;
                                let period;
                                if (!this.periodInExcel) {
                                    period = this.period;
                                } else if (this.periodColumn) {
                                    const p = data[this.periodColumn.value]['v'];
                                    period = p.toString();
                                }


                                if (!this.organisationUnitInExcel) {
                                    orgUnit = this.organisation.value
                                } else {
                                    const ou = data[this.organisationCell.value]['v'];
                                    const foundOU = dataSetUnits[ou];
                                    if (foundOU) {
                                        orgUnit = foundOU;
                                    } else {
                                        NotificationManager.error(`Organisation unit ${ou} not found`);
                                    }
                                }

                                let found;

                                if (this.attributeCombosInExcel) {
                                    const rowData = this.categoryCombo.categories.map(category => {
                                        const value = data[category.mapping.value];
                                        return value ? value.v : undefined;
                                    });
                                    found = findAttributeCombo(this, rowData, false);

                                } else {
                                    const rowData = this.categoryCombo.categories.map(category => {
                                        return category.mapping.value;
                                    });
                                    found = findAttributeCombo(this, rowData, true);
                                }
                                if (found) {
                                    dataValues = [...dataValues, {
                                        dataElement,
                                        value: data[mapping.value]['v'],
                                        categoryOptionCombo: coc.id,
                                        period,
                                        attributeOptionCombo: found.id,
                                        orgUnit
                                    }]
                                }


                            });
                        } else if (this.templateType === '3') {
                            if (this.rows) {
                                this.rows.forEach(r => {
                                    const rowData = this.categoryCombo.categories.map(category => {
                                        const optionCell = category.mapping.value + r;
                                        const optionValue = this.data[optionCell];
                                        return optionValue ? optionValue.v : undefined;
                                    });
                                    const found = findAttributeCombo(this, rowData, false);
                                    if (found) {
                                        _.forOwn(coc.column, (mapping, dataElement) => {
                                            const cell = mapping.value + r;
                                            let orgUnit = data[this.organisationColumn.value + r]['v'];
                                            let period = data[this.periodColumn.value + r]['v'];
                                            let value = data[cell]['v'];
                                            orgUnit = dataSetUnits[orgUnit];
                                            dataValues = [...dataValues, {
                                                dataElement,
                                                value,
                                                categoryOptionCombo: coc.id,
                                                attributeOptionCombo: found.id,
                                                period,
                                                orgUnit
                                            }]
                                        });
                                    }
                                })
                            }
                        }
                    });
                }
            });
        } else if (this.templateType === '4') {
            let periodMissing = false;
            let valueMissing = false;
            let orgUnitMissing = false;
            this.rows.forEach(i => {
                const rowData = this.categoryCombo.categories.map(category => {
                    const optionCell = category.mapping.value + i;
                    const optionValue = this.data[optionCell];
                    return optionValue ? optionValue.v : undefined;
                });

                const found = findAttributeCombo(this, rowData, false);
                if (found) {
                    _.forOwn(this.cell2, v => {
                        const oCell = this.orgUnitColumn.value + i;
                        const pCell = this.periodColumn.value + i;
                        const vCell = v.value.column + i;
                        const ouVal = this.data[oCell];
                        const periodVal = this.data[pCell];
                        const ou = ouVal ? ouVal['v'].toLowerCase() : '';
                        const period = periodVal ? periodVal['v'] : null;
                        const val = this.data[vCell];
                        const value = val ? val.v : null;

                        const orgUnit = dataSetUnits[ou];
                        if (orgUnit && value && period) {
                            dataValues = [...dataValues, {
                                orgUnit,
                                period,
                                value,
                                dataElement: v.value.dataElement,
                                attributeOptionCombo: found.id,
                                categoryOptionCombo: v.value.categoryOptionCombo
                            }];
                        } else {
                            if (!orgUnit) {
                                orgUnitMissing = true;
                            }
                            if (!period) {
                                periodMissing = true;
                            }

                            if (!value) {
                                valueMissing = true;
                            }
                        }

                    });
                }
            });

            if (orgUnitMissing) {
                NotificationManager.warning(`Some rows are missing organisation units, will be ignored`);
            }
            if (periodMissing) {
                NotificationManager.warning(`Some rows are missing periods, will be ignored`);
            }

            if (valueMissing) {
                NotificationManager.warning(`Some rows are missing values, will be ignored`);
            }
        }
        dataValues = dataValues.filter(dv => {
            return dv.orgUnit && dv.period
        });
        if (dataValues.length > 0) {
            return alasql('SELECT orgUnit,dataElement,attributeOptionCombo,categoryOptionCombo,period,SUM(`value`) AS `value` FROM ? GROUP BY orgUnit,dataElement,attributeOptionCombo,categoryOptionCombo,period', [dataValues]);
        }


        return dataValues

    }

    @computed get whatToComplete() {
        const p = this.processed.map(d => {
            return _.pick(d, ['orgUnit', 'period']);
        });

        return _.uniqWith(p, _.isEqual).map(p => {
            return {dataSet: this.id, organisationUnit: p.orgUnit, period: p.period}
        });
    }

    @computed get finalData() {

        return this.processed.map((v, k) => {
            return {...v, id: k}
        })

    }


    @computed get disableCheckBox1() {
        return this.templateType !== '2';
    }

    @computed get disableCheckBox2() {
        return this.templateType !== '2';
    }

    @computed get disableCheckBox3() {
        return !this.organisationUnitInExcel;
    }

    @computed get disableCheckBox4() {
        return this.templateType !== '2';
    }

    @computed get organisations() {
        if (this.organisationUnits) {
            return this.organisationUnits.map(o => {
                return {label: o.name, value: o.id};
            });
        }

        return [];
    }

    @computed get organisationColumns() {
        if (this.organisationUnits) {
            return this.organisationUnits.map(o => {
                return {label: o.name, value: o.id};
            });
        }
        return [];
    }

    @computed get uniqueDataElements() {
        if (this.isDhis2) {
            if (this.dhis2DataSet) {
                return this.dhis2DataSet.dataSetElements.map(dse => {
                    return {label: dse.dataElement.name, value: dse.dataElement.name}
                })
            }
            return [];
        } else {
            return _.keys(this.data).map(d => {
                return {label: d, value: d}
            });
        }
    }

    @computed get periodMapped() {
        if (this.templateType === '1' || this.templateType === '3' || this.templateType === '4') {
            return !!this.periodColumn;
        } else {
            if (this.periodInExcel) {
                return !!this.periodColumn
            }

            return !!this.period;
        }
    }

    @computed get ouMapped() {
        if (this.templateType === '1' || this.templateType === '3' || this.templateType === '4') {
            return !!this.orgUnitColumn || !!this.orgUnitStrategy;
        } else {
            if (this.organisationUnitInExcel) {
                return !!this.organisationCell || !!this.orgUnitStrategy
            }

            return !!this.organisation;
        }
    }

    @computed get canBeSaved() {
        return _.pick(this,
            [
                'id',
                'aggregateId',
                'name',
                'orgUnitColumn',
                'periodColumn',
                'orgUnitStrategy',
                'dataElementColumn',
                'categoryOptionComboColumn',
                'dataValueColumn',
                'headerRow',
                'dataStartRow',
                'forms',
                'organisationUnits',
                'organisationColumn',
                'periodInExcel',
                'organisationUnitInExcel',
                'attributeCombosInExcel',
                'categoryCombo',
                'url',
                'mapping',
                'currentData',
                'dataValues',
                'periodType',
                'period',
                'organisation',
                'organisationCell',
                'dataStartColumn',
                'templateType',
                'cell2',
                'username',
                'password',
                'params',
                'responseKey',
                'isDhis2',
                'selectedDataSet',
                'currentLevel',
                'template',
                'mappingName',
                'mappingDescription',
                'completeDataSet'
            ])
    }

    @computed get categories() {
        return this.categoryCombo.categories.map(category => {
            return {label: category.name, value: category.id}
        })
    }

    @computed get currentDataValues() {
        if (this.processed && this.processed.length > 0) {
            return this.processed.slice(this.page * this.rowsPerPage, this.page * this.rowsPerPage + this.rowsPerPage);
        }
        return [];
    }

    @computed get addition() {
        switch (this.periodType) {
            case 'Daily':
                return 'days';
            case 'Weekly':
                return 'weeks';
            case 'Monthly':
                return 'months';
            case 'Quarterly':
                return 'quarters';
            case 'Yearly':
            case 'FinancialJuly':
            case 'FinancialApril':
            case 'FinancialOct':
                return 'years';

            default:
                return null
        }
    }

    @computed get additionFormat() {
        switch (this.periodType) {
            case 'Daily':
                return 'YYYYMMDD';
            case 'Weekly':
                return 'YYYY[W]WW';
            case 'Monthly':
                return 'YYYYMM';
            case 'Quarterly':
                return 'YYYY[Q]Q';
            case 'Yearly':
                return 'YYYY';
            case 'FinancialJuly':
                return 'YYYY[July]';
            case 'FinancialApril':
                return 'YYYY[April]';
            case 'FinancialOct':
                return 'YYYY[Oct]';
            default:
                return null
        }
    }
}

export default DataSet;
