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
    dataSet.setTypeOfSupportColumn(ds.typeOfSupportColumn);

    return dataSet;

};


export const findAttributeCombo = (dataSet, data) => {
    return dataSet.categoryCombo.categoryOptionCombos.find(coc => {
        const attributeCombo = data.map(v => {
            const match = coc.categoryOptions.find(co => {
                return v !== undefined && (co.id === `${v}` || co.code === `${v}` || co.name === `${v}`);
            });
            return !!match;
        });
        return _.every(attributeCombo);
    });
};


export const findMechanism = (label) => {
    const matches = label.match(/\((.*?)\)/);

    const matchString = matches[1];

    const tokens = matchString.split(',');

    return tokens[1];
};

export const searchSecond = (label, categoryOptionCombos) => {
    const matches = label.match(/\((.*?)\)/);

    const matchString = matches[1];

    const tokens = matchString.split(',');

    const mechanism = tokens[1];

    let newMechanism;

    if (mechanism.indexOf('DSD') !== -1) {
        newMechanism = ' TA'
    } else if (mechanism.indexOf('TA') !== -1) {
        newMechanism = ' DSD'
    }

    tokens[1] = newMechanism;

    const newMatch = tokens.join(',');

    const newLabel = label.replace(matchString, newMatch);

    return categoryOptionCombos.find(coc => {
        return newLabel === coc.label
    });

};