import {action, computed, observable} from "mobx";
import _ from 'lodash';
import XLSX from "xlsx";
import nest from "../utils";

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
    @observable orgUnitStrategy;

    @observable organisationUnits;

    @observable fixedExcel = false;
    @observable periodInExcel = false;
    @observable organisationUnitInExcel = false;
    @observable attributeCombosInExcel = false;
    @observable multipleOrganisations = false;

    @observable dataSetColumn;
    @observable dataElementColumn;
    @observable categoryOptionComboColumn;
    @observable dataValueColumn;

    @observable headerRow = 1;
    @observable dataStartRow = 2;

    @observable uploadMessage = '';
    @observable uploaded = 0;

    @observable d2;

    @observable mapping;

    @observable currentData;

    @observable dataValues;

    @observable periodType;

    @observable period;

    @observable organisation;
    @observable periodCell;
    @observable organisationCell;

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
    @action setDataSetColumn = val => this.dataSetColumn = val;
    @action setDataElementColumn = val => this.dataElementColumn = val;
    @action setCategoryOptionComboColumn = val => this.categoryOptionComboColumn = val;
    @action setDataValueColumn = val => this.dataValueColumn = val;
    @action setHeaderRow = val => this.headerRow = val;
    @action setDataStartRow = val => this.dataStartRow = val;
    @action setOrganisationUnits = val => this.organisationUnits = val;
    @action setPeriodType = val => this.periodType = val;
    @action setOrganisation = val => this.organisation = val;
    @action setPeriodCell = val => this.periodCell = val;
    @action setOrganisationCell = val => this.organisationCell = val;
    @action setWorkSheet = val => this.workSheet = val;
    @action setFixedExcel = val => this.fixedExcel = val;
    @action setPeriod = val => this.period = val;


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

    @action
    handleCreateNewEventsCheck = event => {
        this.createNewEvents = event.target.checked;

        if (!this.createNewEvents) {
            this.eventDateColumn = null;
        }
    };

    @action handleFixedExcel = event => {
        this.fixedExcel = event.target.checked;

        if (!this.fixedExcel) {
            this.multipleOrganisations = false;
            this.periodInExcel = false;
            this.organisationUnitInExcel = false;
            this.attributeCombosInExcel = false;
        }
    };

    @action handlePeriodInExcel = event => {
        this.periodInExcel = event.target.checked;

        if (!this.periodInExcel) {
            this.period = null;
        }

        if (this.periodInExcel) {
            this.periodCell = this.cells[0];
        }
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

    @action handleMultipleOrganisations = event => {
        this.multipleOrganisations = event.target.checked;
    };

    @action handleAttributeCombosInExcel = event => {
        this.attributeCombosInExcel = event.target.checked;
    };

    @action saveAggregate = async aggregates => {

        const dataSet = _.findIndex(aggregates, {aggregateId: this.aggregateId});

        if (dataSet !== -1) {
            aggregates.splice(aggregates, 1, this);

        } else {
            const maxAgg = _.maxBy(aggregates, 'aggregateId') || 0;
            this.aggregateId = maxAgg + 1;
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
        }

        return [];
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
            if (!this.fixedExcel && this.dataElementColumn) {
                const data = XLSX.utils.sheet_to_json(this.workSheet, {
                    range: this.headerRow - 1,
                    dateNF: 'YYYY-MM-DD'
                });

                return nest(data, [this.dataElementColumn.value]);
            } else if (this.cells.length > 0) {
                return _.fromPairs(this.cells.map(c => {
                    return [c.value, this.workSheet[c.value]]
                }));
            } else {
                return null;
            }
        }
        return null;
    }

    @computed get processed() {
        const forms = this.forms;
        let data = this.data;
        let dataValues = [];

        forms.forEach(f => {
            /*const elements = _.fromPairs(f.dataElements.map(element => {
                return [element.id, element.valueType];
            }));*/

            if (!this.fixedExcel) {
                let p = {};
                data = f.dataElements.forEach(element => {
                    if (element.mapping) {
                        const foundData = data[element.mapping.value];

                        const groupedData = _.fromPairs(foundData.map(d => {
                            return [d[this.categoryOptionComboColumn.value], {
                                period: d[this.periodColumn.value],
                                value: d[this.dataValueColumn.value]
                            }]
                        }));

                        const obj = _.fromPairs([[element.id, groupedData]]);

                        p = {...p, ...obj}
                    }
                });
                data = p;
            }
            if (data) {
                f.categoryOptionCombos.forEach(coc => {
                    if (this.fixedExcel) {
                        _.forOwn(coc.cell, (mapping, dataElement) => {
                            dataValues = [...dataValues, {
                                dataElement,
                                value: data[mapping.value]['v'],
                                categoryOptionCombo: coc.id
                            }]
                        })
                    } else {
                        _.forOwn(coc.mapping, (mapping, dataElement) => {
                            dataValues = [...dataValues, {
                                dataElement,
                                value: data[dataElement][mapping.value]['value'],
                                period: data[dataElement][mapping.value]['period'],
                                categoryOptionCombo: coc.id
                            }]
                        })
                    }
                });
            }
        });

        return dataValues;

    }


    @computed get disableCheckBox1() {
        return !this.fixedExcel;
    }

    @computed get disableCheckBox2() {
        return !this.fixedExcel;
    }

    @computed get disableCheckBox3() {
        return !this.organisationUnitInExcel;
    }

    @computed get disableCheckBox4() {
        return !this.fixedExcel;
    }

    @computed get organisations() {
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

    @computed get canBeSaved() {
        return _.pick(this,
            [
                'id',
                'aggregateId',
                'orgUnitColumn',
                'periodColumn',
                'orgUnitStrategy',
                'dataSetColumn',
                'dataElementColumn',
                'categoryOptionComboColumn',
                'dataValueColumn',
                'headerRow',
                'dataStartRow',
                'forms',
                'organisationUnits',

                'fixedExcel',
                'periodInExcel',
                'organisationUnitInExcel',
                'multipleOrganisations',
                'categoryCombo',

                'mapping',
                'currentData',
                'dataValues',
                'periodType',
                'period',
                'organisation',
                'periodCell',
                'organisationCell',
            ])
    }

    @computed get categories() {
        return this.categoryCombo.categories.map(category => {
            return {label: category.name, value: category.id}
        })
    }
}

export default DataSet;
