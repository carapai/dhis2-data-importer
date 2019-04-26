import _ from "lodash";
import XLSX from "xlsx";
import DataSet from "./stores/DataSet";
import CategoryCombo from "./stores/CategoryCombo";
import Category from "./stores/Category";
import CategoryOption from "./stores/CategoryOption";
import CategoryOptionCombo from "./stores/CategoryOptionCombo";
import Form from "./stores/Form";
import Element from "./stores/Element";
import OrganisationUnit from "./stores/OrganisationUnit";
import Option from "./stores/Option";
import OptionSet from "./stores/OptionSet";
import DataElement from "./stores/DataElement";
import ProgramStageDataElement from "./stores/ProgramStageDataElement";
import ProgramStage from "./stores/ProgramStage";
import TrackedEntityAttribute from "./stores/TrackedEntityAttribute";
import ProgramTrackedEntityAttribute from "./stores/ProgramTrackedEntityAttribute";
import Program from "./stores/Program";
import TrackedEntityType from "./stores/TrackedEntityType";
import Param from "./stores/Param";
import moment from "moment";
import {generateUid} from "d2/uid";
// import {NotificationManager} from "react-notifications";
// import alasql from "alasql";

export const nest = function (seq, keys) {
    if (!keys.length)
        return seq;
    const first = keys[0];
    const rest = keys.slice(1);
    return _.mapValues(_.groupBy(seq, first), function (value) {
        return nest(value, rest)
    });
};


export const processMergedCells = (mergedCells, data, mergedCell, processed, dataElement) => {
    const merged = mergedCells.filter(e => {
        return e.s.r === mergedCell.s.r + 1 && e.s.c >= mergedCell.s.c && e.e.c <= mergedCell.e.c;
    });

    if (merged.length > 0) {
        merged.forEach(val => {
            const cell_address = {
                c: val.s.c,
                r: val.s.r
            };
            const cell_ref = XLSX.utils.encode_cell(cell_address);

            if (mergedCell.previous) {
                val.previous = mergedCell.previous + ',' + data[cell_ref]['v'];
            } else {
                val.previous = data[cell_ref]['v'];
            }
            processed = processMergedCells(mergedCells, data, val, processed, dataElement);
        });
    } else {

        if (mergedCell.s.c === mergedCell.e.c) {
            let column = {
                column: XLSX.utils.encode_col(mergedCell.s.c),
                name: dataElement
            };
            processed = [...processed, column];

        } else {
            for (let i = mergedCell.s.c; i <= mergedCell.e.c; i++) {
                const cell_address = {
                    c: i,
                    r: mergedCell.s.r + 1
                };
                const cell_ref = XLSX.utils.encode_cell(cell_address);

                let column = {
                    column: XLSX.utils.encode_col(i),
                    name: dataElement + ": " + data[cell_ref]['v']
                };
                if (mergedCell.previous) {
                    column = {
                        ...column,
                        name: dataElement + ": " + mergedCell.previous + ',' + data[cell_ref]['v']
                    }
                }

                processed = [...processed, column];
            }
        }

    }
    return processed;
};


export const convertAggregate = (ds, d2) => {

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

        const categoryOptions = coc.categoryOptions.map(co => {
            return new CategoryOption(co.id, co.name, co.code);
        });
        categoryOptionCombo.setCategoryOptions(categoryOptions);
        return categoryOptionCombo;
    });

    dateSetCategoryCombo.setCategoryOptionCombos(dateSetCategoryOptionCombos);
    dateSetCategoryCombo.setCategories(categories);

    dataSet.setCategoryCombo(dateSetCategoryCombo);


    const forms = ds.forms.map(form => {

        const f = new Form();
        const dataElements = form.dataElements.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        }).map(de => {
            const dataElement = new Element();
            dataElement.setId(de.id);
            dataElement.setCode(de.code);
            dataElement.setName(de.name);
            dataElement.setValueType(de.valueType);
            dataElement.setMapping(de.mapping);
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
                categoryOptionCombo.setColumn(found[0].column || {});
            }
            return categoryOptionCombo;

        });

        f.setCategoryOptionCombos(categoryOptionCombos);
        f.setDataElements(dataElements);
        f.setName(form.name);

        return f;

    });

    dataSet.setForms(forms);

    dataSet.setD2(d2);

    dataSet.setId(ds.id);
    dataSet.setCode(ds.code);
    dataSet.setName(ds.name);
    dataSet.setPeriodType(ds.periodType);
    dataSet.setPeriodType(ds.periodType);
    dataSet.setDataValues(ds.dataValues);
    dataSet.setOrgUnitColumn(ds.orgUnitColumn);
    dataSet.setOrganisationColumn(ds.organisationColumn);
    dataSet.setOrgUnitStrategy(ds.orgUnitStrategy);
    dataSet.setPeriodColumn(ds.periodColumn);
    dataSet.setDataElementColumn(ds.dataElementColumn);
    dataSet.setCategoryOptionComboColumn(ds.categoryOptionComboColumn);
    dataSet.setDataValueColumn(ds.dataValueColumn);
    dataSet.setHeaderRow(ds.headerRow || 1);
    dataSet.setDataStartRow(ds.dataStartRow || 2);
    dataSet.setPeriod(ds.period);
    dataSet.setAggregateId(ds.aggregateId || 1);
    dataSet.setUsername(ds.username || '');
    dataSet.setPassword(ds.password || '');
    dataSet.setResponseKey(ds.responseKey || '');

    if (ds.params) {
        const params = ds.params.map(p => {
            const param = new Param();
            param.setParam(p.param);
            param.setValue(p.value);

            return param;
        });

        dataSet.setParams(params);
    }

    const ous = ds.organisationUnits.map(ou => {
        return new OrganisationUnit(ou.id, ou.name, ou.code)
    });

    dataSet.setOrganisationUnits(ous);

    dataSet.setOrganisation(ds.organisation);
    dataSet.setPeriod(ds.period);
    dataSet.setOrganisationCell(ds.organisationCell);
    dataSet.setDataStartColumn(ds.dataStartColumn);
    dataSet.setUrl(ds.url || '');
    dataSet.setTemplateType(ds.templateType || '1');
    dataSet.setCell2(ds.cell2 || {});
    dataSet.setIsDhis2(ds.isDhis2);
    dataSet.setTemplate(ds.template || 0);
    dataSet.setMappingName(ds.mappingName || '');
    dataSet.setMappingDescription(ds.mappingDescription || '');
    dataSet.setCompleteDataSet(ds.completeDataSet);

    if (dataSet.isDhis2) {
        dataSet.setDhis2DataSetChange(ds.selectedDataSet);
        dataSet.loadLevelsAndDataSets();
        dataSet.setCurrentLevel(ds.currentLevel);
    }

    return dataSet;

};

export const convert = (program, d2) => {
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
            dataElement.setAsIdentifier(psd.dataElement.identifiesEvent);
            const programStageDataElement = new ProgramStageDataElement(psd.compulsory, dataElement);
            if (psd.column) {
                programStageDataElement.setColumn(psd.column);
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
        programsStage.setEventDateAsIdentifier(ps.eventDateIdentifiesEvent);
        programsStage.setCompleteEvents(ps.completeEvents);
        programsStage.setLongitudeColumn(ps.longitudeColumn);
        programsStage.setLatitudeColumn(ps.latitudeColumn);
        programsStage.setCreateNewEvents(ps.createNewEvents);
        programsStage.setUpdateEvents(ps.updateEvents);
        programsStage.setEventDateColumn(ps.eventDateColumn);
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
            optionSet = new OptionSet(options);
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

    p.setD2(d2);
    // p.setOrder(program.order);
    // p.setOrderBy(program.orderBy);
    p.setOrgUnitStrategy(program.orgUnitStrategy);
    p.setHeaderRow(program.headerRow || 1);
    p.setDataStartRow(program.dataStartRow || 2);
    p.setCreateNewEnrollments(program.createNewEnrollments);
    p.setCreateEntities(program.createEntities);
    p.setUpdateEntities(program.updateEntities);
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
    p.setSelectedSheet(program.selectedSheet);
    p.setErrors([]);
    p.setConflicts([]);
    p.setMappingName(program.mappingName || '');
    p.setMappingDescription(program.mappingDescription || '');

    return p;
};

export const findAttributeCombo = (dataSet, data, compareId) => {
    return dataSet.categoryCombo.categoryOptionCombos.find(coc => {
        const attributeCombo = data.map(v => {
            const match = coc.categoryOptions.find(co => {
                if (compareId) {
                    return v !== undefined && co.id === v;
                }
                return v !== undefined && co.name === v;
            });
            return !!match;
        });
        return _.every(attributeCombo);
    });
};


export const encodeData = (objs) => {
    return objs.map(s => {
        return encodeURIComponent(s.param) + '=' + encodeURIComponent(s.value)
    }).join('&');
};

export const createParam = val => {
    const param = new Param();

    param.setParam(val.param);
    param.setValue(val.value);

    return param;
};

export const enumerateDates = (startDate, endDate, addition, format) => {
    const dates = [];
    const currDate = moment(startDate).startOf(addition);
    const lastDate = moment(endDate).startOf(addition);
    dates.push(currDate.clone().format(format));
    while (currDate.add(1, addition).diff(lastDate) < 0) {
        dates.push(currDate.clone().format(format));
    }
    return dates;
};

export const processOrganisationUnits = (dataSet) => {
    if (dataSet.orgUnitStrategy && dataSet.organisationUnits) {
        return _.fromPairs(dataSet.organisationUnits.map(o => {
            if (dataSet.orgUnitStrategy && dataSet.orgUnitStrategy.value === 'name') {
                return [o.name.toLowerCase(), o.id];
            } else if (dataSet.orgUnitStrategy && dataSet.orgUnitStrategy.value === 'code') {
                return [o.code, o.id];
            }
            return [o.id, o.id];

        }));
    }
    return {};
};


export const processDataSet = (data, dataSet) => {
    let dataValues = [];

    let dataSetUnits = processOrganisationUnits(dataSet);

    const {
        templateType,
        forms,
        periodColumn,
        dataValueColumn,
        orgUnitColumn,
        categoryCombo,
        categoryOptionComboColumn,
        periodInExcel,
        organisationUnitInExcel,
        organisation,
        organisationCell,
        attributeCombosInExcel,
        rows,
        cell2,
        organisationColumn
    } = dataSet;


    if (templateType !== '4') {
        forms.forEach(f => {
            if (templateType === '1') {

                let validatedData = [];
                f.dataElements.forEach(element => {
                    if (element.mapping) {
                        const foundData = data[element.mapping.value];
                        if (foundData) {
                            const groupedData = foundData.map(d => {

                                const rowData = categoryCombo.categories.map(category => {
                                    const optionColumn = category.mapping.value;
                                    return d[optionColumn]
                                });

                                return {
                                    period: d[periodColumn.value],
                                    value: d[dataValueColumn.value],
                                    orgUnit: d[orgUnitColumn.value] ? d[orgUnitColumn.value].toLocaleLowerCase() : null,
                                    dataElement: element.id,
                                    attributeValue: rowData,
                                    categoryOptionCombo: d[categoryOptionComboColumn.value] ? d[categoryOptionComboColumn.value].toLocaleLowerCase() : null
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
                    if (templateType === '1') {
                        _.forOwn(coc.mapping, (mapping, dataElement) => {
                            const filtered = data.filter(v => {
                                return mapping && mapping.value && v.categoryOptionCombo === mapping.value.toLocaleLowerCase() && v.dataElement === dataElement;
                            });
                            filtered.forEach(d => {
                                const attribute = findAttributeCombo(dataSet, d.attributeValue, false);
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
                    } else if (templateType === '2') {
                        _.forOwn(coc.cell, (mapping, dataElement) => {
                            let orgUnit;
                            let period;
                            if (!periodInExcel) {
                                period = dataSet.period;
                            } else if (periodColumn) {
                                const p = data[periodColumn.value]['v'];
                                period = p.toString();
                            }


                            if (!organisationUnitInExcel) {
                                orgUnit = organisation.value
                            } else {
                                const ou = data[organisationCell.value]['v'];
                                const foundOU = dataSetUnits[ou];
                                if (foundOU) {
                                    orgUnit = foundOU;
                                } else {
                                    // NotificationManager.error(`Organisation unit ${ou} not found`);
                                }
                            }

                            let found;

                            if (attributeCombosInExcel) {
                                const rowData = categoryCombo.categories.map(category => {
                                    const value = data[category.mapping.value];
                                    return value ? value.v : undefined;
                                });
                                found = findAttributeCombo(dataSet, rowData, false);

                            } else {
                                const rowData = categoryCombo.categories.map(category => {
                                    return category.mapping.value;
                                });
                                found = findAttributeCombo(dataSet, rowData, true);
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
                    } else if (templateType === '3') {
                        if (rows) {
                            rows.forEach(r => {
                                const rowData = categoryCombo.categories.map(category => {
                                    const optionCell = category.mapping.value + r;
                                    const optionValue = data[optionCell];
                                    return optionValue ? optionValue.v : undefined;
                                });
                                const found = findAttributeCombo(dataSet, rowData, false);
                                if (found) {
                                    _.forOwn(coc.column, (mapping, dataElement) => {
                                        const cell = mapping.value + r;
                                        let orgUnit = data[organisationColumn.value + r]['v'];
                                        let period = data[periodColumn.value + r]['v'];
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
    } else if (templateType === '4') {
        let periodMissing = false;
        let valueMissing = false;
        let orgUnitMissing = false;
        rows.forEach(i => {
            const rowData = categoryCombo.categories.map(category => {
                const optionCell = category.mapping.value + i;
                const optionValue = data[optionCell];
                return optionValue ? optionValue.v : undefined;
            });

            const found = findAttributeCombo(dataSet, rowData, false);
            if (found) {
                _.forOwn(cell2, v => {
                    const oCell = orgUnitColumn.value + i;
                    const pCell = periodColumn.value + i;
                    const vCell = v.value.column + i;
                    const ouVal = data[oCell];
                    const periodVal = data[pCell];
                    const ou = ouVal ? ouVal['v'].toLowerCase() : '';
                    const period = periodVal ? periodVal['v'] : null;
                    const val = data[vCell];
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
            // NotificationManager.warning(`Some rows are missing organisation units, will be ignored`);
        }
        if (periodMissing) {
            // NotificationManager.warning(`Some rows are missing periods, will be ignored`);
        }

        if (valueMissing) {
            // NotificationManager.warning(`Some rows are missing values, will be ignored`);
        }
    }
    dataValues = dataValues.filter(dv => {
        return dv.orgUnit && dv.period
    });

    // if (dataValues.length > 0) {
    //     return alasql('SELECT orgUnit,dataElement,attributeOptionCombo,categoryOptionCombo,period,SUM(`value`) AS `value` FROM ? GROUP BY orgUnit,dataElement,attributeOptionCombo,categoryOptionCombo,period', [dataValues]);
    // }


    return dataValues

};

export const programUniqueColumn = (program) => {
    const unique = program.programTrackedEntityAttributes.filter(a => {
        return a.trackedEntityAttribute.unique && a.column;
    });

    if (unique.length > 0) {
        return unique[0]['column']['value'];
    }

    return null;
};

export const programUniqueAttribute = (program) => {
    const unique = program.programTrackedEntityAttributes.filter(a => {
        return a.trackedEntityAttribute.unique;
    });

    if (unique.length > 0) {
        return unique[0]['trackedEntityAttribute']['id'];
    }

    return null;
};


export const validText = (dataType, value) => {
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
};

export const validateValue = (dataType, value, optionSet) => {
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
    } else if (validText(dataType, value)) {
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
};

export const searchOrgUnit = (val, orgUnitStrategy, organisationUnits) => {
    switch (orgUnitStrategy.value) {
        case 'uid':
            return _.find(organisationUnits, {
                id: val
            });
        case 'code':
            return _.find(organisationUnits, {
                code: val
            });
        case 'name':
            return _.find(organisationUnits, {
                name: val
            });
        case 'auto':
            const s1 = _.find(organisationUnits, {
                id: val
            });
            const s2 = _.find(organisationUnits, {
                code: val
            });
            const s3 = _.find(organisationUnits, {
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
};

export const getLocation = (href) => {
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
};

export const removeDuplicates = (evs, stageEventFilters) => {
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

export const searchEvent = (enrollmentEvents, stageEventFilters, stage, e) => {
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
                moment(e.eventDate, 'YYYY-MM-DD').format('YYYY-MM-DD') &&
                _.every(filteredAndSame, 'exists');
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

export const isTracker = (program) => {
    return program.programType === 'WITH_REGISTRATION';
};

export const groupEntities = (attribute, trackedEntityInstances,) => {
    const entities = trackedEntityInstances.map(e => {
        const uniqueAttribute = _.find(e.attributes, {
            attribute
        });
        const val = uniqueAttribute ? uniqueAttribute['value'] : null;
        return {
            ...e,
            ..._.fromPairs([
                [attribute, val]
            ])
        }
    });
    return _.groupBy(entities, attribute);
};


export const processProgramData = (data, program, uniqueColumn, instances, isTracker) => {

    let eventsUpdate = [];
    let trackedEntityInstancesUpdate = [];

    let newEvents = [];
    let newEnrollments = [];
    let newTrackedEntityInstances = [];

    let duplicates = [];
    let conflicts = [];
    let errors = [];

    const {
        id,
        programStages,
        dataSource,
        programTrackedEntityAttributes,
        incidentDateColumn,
        enrollmentDateColumn,
        trackedEntityType,
        trackedEntity,
        updateEntities,
        createEntities,
        createNewEnrollments,
        orgUnitStrategy,
        orgUnitColumn
    } = program;


    if (uniqueColumn) {
        data = data.filter(d => {
            return d[uniqueColumn] !== null && d[uniqueColumn] !== undefined;
        });
        let clients = _.groupBy(data, uniqueColumn);
        let newClients = [];
        _.forOwn(clients, (data, client) => {
            const previous = instances[client] || [];
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
                programStages.forEach(stage => {
                    let dataValues = [];
                    let eventDate;
                    if (stage.eventDateColumn && (stage.createNewEvents || stage.updateEvents) && dataSource === 2) {
                        const date = moment(d[stage.eventDateColumn.value]);
                        if (date.isValid()) {
                            eventDate = date.format('YYYY-MM-DD');
                        }
                    } else if (stage.eventDateColumn && (stage.createNewEvents || stage.updateEvents)) {
                        const date = moment(d[stage.eventDateColumn.value], 'YYYY-MM-DD');
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
                            const validatedValue = validateValue(type, value, optionsSet);

                            if (value !== '' && validatedValue !== null) {
                                dataValues = [...dataValues, {
                                    dataElement: e.dataElement.id,
                                    value: validatedValue
                                }];
                            } else if (value !== undefined) {
                                conflicts = [...conflicts, {
                                    error: optionsSet === null ? 'Invalid value ' + value + ' for value type ' + type : 'Invalid value: ' + value + ', expected: ' + _.map(optionsSet.options, o => {
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
                            program: id,
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
                                ...event,
                                ...{
                                    status: 'COMPLETED',
                                    completedDate: event['eventDate']
                                }
                            }
                        }

                        events = [...events, event];
                    }
                });

                const mappedAttributes = programTrackedEntityAttributes.filter(a => {
                    return a.column && a.column.value
                });

                let attributes = [];

                mappedAttributes.forEach(a => {
                    const value = d[a.column.value];
                    const type = a.valueType;
                    const optionsSet = a.trackedEntityAttribute.optionSet;
                    const validatedValue = validateValue(type, value, optionsSet);

                    if (value !== '' && validatedValue !== null) {
                        attributes = [...attributes, {
                            attribute: a.trackedEntityAttribute.id,
                            value: validatedValue
                        }]
                    } else if (value !== undefined) {
                        conflicts = [...conflicts, {
                            error: !optionsSet ? 'Invalid value ' + value + ' for value type ' + type : 'Invalid value ' + value + ' choose from options: ' +
                                _.map(optionsSet.options, o => o.code).join(','),
                            row: client.client,
                            column: a.column.value
                        }]
                    }

                });

                if (attributes.length > 0) {
                    allAttributes = [...allAttributes, attributes];
                }

                if (isTracker && enrollmentDateColumn && incidentDateColumn) {
                    const enrollmentDate = moment(d[enrollmentDateColumn.value], 'YYYY-MM-DD');
                    const incidentDate = moment(d[incidentDateColumn.value], 'YYYY-MM-DD');

                    if (enrollmentDate.isValid() && incidentDate.isValid()) {
                        enrollmentDates = [...enrollmentDates, {
                            enrollmentDate: enrollmentDate.format('YYYY-MM-DD'),
                            incidentDate: incidentDate.format('YYYY-MM-DD')
                        }]
                    }
                }

                if (orgUnitColumn !== '') {
                    orgUnits = [...orgUnits, d[orgUnitColumn.value]]
                }
            });
            let groupedEvents = _.groupBy(events, 'programStage');

            if (client.previous.length > 1) {
                duplicates = [...duplicates, {identifier: client.client}]
            } else if (client.previous.length === 1) {
                client.previous.forEach(p => {
                    let enrollments = p['enrollments'];
                    if (updateEntities) {
                        const nAttributes = _.differenceWith(allAttributes[0], p['attributes'], (a, b) => {
                            return a.attribute === b.attribute && a.value + '' === b.value + '';
                        });
                        if (nAttributes.length > 0) {
                            const mergedAttributes = _.unionBy(allAttributes[0], p['attributes'], 'attribute');
                            let tei;

                            if (trackedEntityType) {
                                tei = {
                                    ..._.pick(p, ['orgUnit', 'trackedEntityInstance', 'trackedEntityType']),
                                    attributes: mergedAttributes
                                };
                            } else if (trackedEntity) {
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
                        program: id
                    });
                    if (enrollmentIndex === -1 && createNewEnrollments && enrollmentDates.length > 0) {
                        let enroll = {
                            program: id,
                            orgUnit: p['orgUnit'],
                            trackedEntityInstance: p['trackedEntityInstance'],
                            ...enrollmentDates[0]
                        };
                        newEnrollments = [...newEnrollments, enroll];
                        _.forOwn(groupedEvents, (evs, stage) => {
                            const stageEventFilters = identifierElements[stage];
                            const stageInfo = _.find(programStages, {
                                id: stage
                            });
                            const {
                                repeatable,
                                createNewEvents,
                            } = stageInfo;

                            evs = removeDuplicates(evs, stageEventFilters);
                            if (createNewEvents) {
                                if (!repeatable) {
                                    const ev = _.maxBy(evs, 'eventDate');
                                    if (ev.dataValues.length > 0) {
                                        newEvents = [...newEvents, ev];
                                    }
                                } else {
                                    newEvents = [...newEvents, ...evs];
                                }
                            }

                        });

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
                            const stageInfo = _.find(programStages, {
                                id: stage
                            });
                            const {
                                repeatable,
                                updateEvents,
                                createNewEvents
                            } = stageInfo;

                            const stageEventFilters = identifierElements[stage];

                            evs = removeDuplicates(evs, stageEventFilters);

                            if (repeatable) {
                                evs.forEach(e => {
                                    const eventIndex = searchEvent(enrollmentEvents, stageEventFilters, stage, e);
                                    if (eventIndex !== -1 && updateEvents) {
                                        const stageEvent = enrollmentEvents[eventIndex];
                                        const differingElements = _.differenceWith(e['dataValues'], stageEvent['dataValues'], (a, b) => {
                                            return a.dataElement === b.dataElement && a.value + '' === b.value + '';
                                        });
                                        if (differingElements.length > 0) {
                                            const mergedEvent = {
                                                ...stageEvent,
                                                dataValues: differingElements
                                            };
                                            eventsUpdate = [...eventsUpdate, mergedEvent];
                                        }
                                    } else if (eventIndex === -1 && createNewEvents) {
                                        newEvents = [...newEvents, e];
                                    }
                                });
                            } else {
                                let foundEvent = _.find(enrollmentEvents, {
                                    programStage: stage
                                });
                                let max = _.maxBy(evs, 'eventDate');
                                if (foundEvent && updateEvents) {
                                    const differingElements = _.differenceWith(max['dataValues'], foundEvent['dataValues'], (a, b) => {
                                        return a.dataElement === b.dataElement && a.value + '' === b.value + '';
                                    });
                                    if (differingElements.length > 0) {
                                        const mergedEvent = {
                                            ...foundEvent,
                                            dataValues: differingElements
                                        };
                                        eventsUpdate = [...eventsUpdate, mergedEvent];
                                    }
                                } else if (!foundEvent && createNewEvents) {
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
                    orgUnit = searchOrgUnit(orgUnits[0]);
                    if (orgUnit) {
                        if (isTracker) {
                            const trackedEntityInstance = generateUid();

                            if (createEntities) {
                                let tei = {
                                    orgUnit: orgUnit.id,
                                    attributes: allAttributes[0],
                                    trackedEntityInstance
                                };

                                if (trackedEntityType) {
                                    tei = {
                                        ...tei,
                                        trackedEntityType: trackedEntityType.id
                                    }
                                } else if (trackedEntity && trackedEntity.id) {
                                    tei = {
                                        ...tei,
                                        trackedEntity: trackedEntity.id
                                    }
                                }
                                newTrackedEntityInstances = [...newTrackedEntityInstances, tei];
                            }

                            if (createNewEnrollments) {

                                let enrollment = {
                                    orgUnit: orgUnit.id,
                                    program: id,
                                    trackedEntityInstance,
                                    ...enrollmentDates[0],
                                    enrollment: generateUid()
                                };

                                newEnrollments = [...newEnrollments, enrollment];

                            }

                            _.forOwn(groupedEvents, (evs, stage) => {
                                const stageEventFilters = identifierElements[stage];
                                const stageInfo = _.find(programStages, {
                                    id: stage
                                });
                                const {
                                    repeatable,
                                    createNewEvents
                                } = stageInfo;
                                evs = evs.map(e => {
                                    return {
                                        ...e,
                                        orgUnit: orgUnit.id,
                                        event: generateUid(),
                                        trackedEntityInstance
                                    }
                                });

                                evs = removeDuplicates(evs, stageEventFilters);

                                if (createNewEvents) {
                                    if (!repeatable) {
                                        newEvents = [...newEvents, _.maxBy(evs, 'eventDate')];
                                    } else {
                                        newEvents = [...newEvents, ...evs]
                                    }
                                }
                            });
                        } else if (!isTracker) {
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
                            error: 'Organisation unit ' + orgUnits[0] + ' not found using strategy ' +
                                orgUnitStrategy.value,
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
};