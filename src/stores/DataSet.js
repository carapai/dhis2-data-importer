import {action, computed, observable} from "mobx";
import _ from 'lodash';
import XLSX from "xlsx";
import {encodeData, findAttributeCombo, nest, processMergedCells} from "../utils";
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


    @observable d2;

    @observable mapping;

    @observable currentData;

    @observable dataValues;

    @observable periodType;

    @observable period;
    @observable displayProgress = false;

    @observable organisation;
    @observable organisationColumn;
    @observable periodCell;
    @observable organisationCell;
    @observable url = '';
    @observable pulledData = null;
    @observable responses = [];
    @observable cell2 = {};

    @observable username = '';

    @observable password = '';

    @observable pulling = false;
    @observable templateType = "1";

    @observable responseKey = '';


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


    @action setSelectedSheet = val => {
        this.selectedSheet = val;
        this.setWorkSheet(this.workbook.Sheets[val.value]);
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
    @action handelURLChange = value => this.url = value;
    @action setDisplayProgress = val => this.displayProgress = val;
    @action setPulledData = val => this.pulledData = val;
    @action setUrl = val => this.url = val;
    @action setAggregateId = val => this.aggregateId = val;
    @action setOrganisationColumn = val => this.organisationColumn = val;
    @action setCell2 = val => this.cell2 = val;
    @action setPulling = val => this.pulling = val;
    @action setUsername = val => this.username = val;

    @action setPassword = val => this.password = val;
    @action setResponseKey = val => this.responseKey = val;

    @action setParams = val => this.params = val;

    @action handleRadioChange = event => {
        this.setTemplateType(event.target.value);

        if (this.templateType !== '2') {
            this.periodInExcel = false;
            this.organisationUnitInExcel = false;
            this.attributeCombosInExcel = false;
        }
    };

    @action addParam = () => {
        this.params = [...this.params, new Param()]
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

    @action
    onDrop = (accepted, rejected) => {
        const fileReader = new FileReader();
        const rABS = true;
        if (accepted.length > 0) {
            this.uploadMessage = '';
            const f = accepted[0];

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
                        search.handelMappingChange(this.data, this.categoryOptionComboColumn)(search.mapping);
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
        } catch (e) {
            console.log(e);
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
                    response = await axios.get(this.url + '?' + param, {
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
                NotificationManager.error(e.message, 'Error', 5000);
                this.setPulling(false)
            }
        }
    };

    @action
    insertDataValues = (data) => {
        const api = this.d2.Api.getApi();
        return api.post('dataValueSets', data, {});
    };


    @action create = async () => {
        this.setDisplayProgress(true);

        try {
            if (this.processed && this.processed.length > 0) {
                const insertResults = await this.insertDataValues({dataValues: this.processed});
                this.setResponses(insertResults);
                const {importCount, conflicts} = this.processedResponses;
                NotificationManager.success(`${importCount.imported}`, 'Imported');
                NotificationManager.success(`${importCount.deleted}`, 'Deleted');
                NotificationManager.success(`${importCount.updated}`, 'Updated');

                if (importCount.ignored > 0) {
                    NotificationManager.warning(`${importCount['ignored']}`, 'Ignored');
                }

                conflicts.forEach(s => {
                    NotificationManager.error(`${s.message}`, 'Error');
                });

                this.setPulledData(null);
                this.setWorkSheet(null);
                this.setWorkbook(null);
                this.setSelectedSheet(null);
            }
        } catch (e) {
            this.setResponses(e);
        }
        this.setDisplayProgress(false);
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
            console.log(e);
        }
    };

    @action setMappingAll2 = de => val => {
        let value = val.value;
        value = {...value, column: de.column};
        val = {
            ...val,
            value
        };
        const obj = _.fromPairs([[de.name, val]]);
        const c = {...this.cell2, ...obj};
        this.setCell2(c);
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

    @computed get processedResponses() {
        let errors = [];
        let conflicts = [];
        let importCount = {};

        this.responses.forEach(response => {
            if (response['status'] === 'SUCCESS' || response['status'] === 'WARNING') {
                importCount = response['importCount'];
                if (response['conflicts']) {
                    conflicts = [...conflicts, ...response['conflicts']]
                }
            } else if (response['httpStatusCode'] === 500) {
                errors = [...errors, {...response['error']}];
            }
        });
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
            console.log(c);
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
                                } else {
                                    period = data[this.periodColumn]['v'];
                                }


                                if (!this.organisationUnitInExcel) {
                                    orgUnit = this.organisation.value
                                } else {
                                    orgUnit = data[this.organisationCell]['v'];
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
                        const ou = ouVal ? ouVal['v'] : '';
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
                        }

                    });
                }
            });
        }
        if (dataValues.length > 0) {
            return alasql('SELECT orgUnit,dataElement,attributeOptionCombo,categoryOptionCombo,period,SUM(`value`) AS `value` FROM ? GROUP BY orgUnit,dataElement,attributeOptionCombo,categoryOptionCombo,period', [dataValues]);
        }
        return dataValues

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
        return _.keys(this.data).map(d => {
            return {label: d, value: d}
        });
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
                'responseKey'
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
}

export default DataSet;
