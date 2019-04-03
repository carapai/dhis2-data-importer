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
    dataSet.setDhis2DataSetChange(ds.selectedDataSet);
    dataSet.loadLevelsAndDataSets();
    dataSet.setCurrentLevel(ds.currentLevel);

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
            } else {
                programStageDataElement.setColumn({
                    name: null,
                    value: null
                });
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
    p.setOrder(program.order);
    p.setOrderBy(program.orderBy);
    p.setOrgUnitStrategy(program.orgUnitStrategy);
    p.setHeaderRow(program.headerRow || 1);
    p.setDataStartRow(program.dataStartRow || 2);
    p.setCreateNewEvents(program.createNewEvents);
    p.setUpdateEvents(program.updateEvents);
    p.setCreateNewEnrollments(program.createNewEnrollments);
    p.setCreateEntities(program.createEntities);
    p.setUpdateEntities(program.updateEntities);
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
    p.setSelectedSheet(program.selectedSheet);
    p.setErrors([]);
    p.setConflicts([]);

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

export const searchTrackedEntityInstance = async (d2, uniqueAttribute, value) => {
    const api = d2.Api.getApi();

    const instance = await api.get('trackedEntityInstances', {
        paging: false,
        ouMode: 'ALL',
        filter: uniqueAttribute + ':EQ:' + value,
        fields: 'trackedEntityInstance'
    });
    console.log(instance);
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