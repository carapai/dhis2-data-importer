import {inject, observer} from 'mobx-react';
import React from 'react';
import {withStyles} from '@material-ui/core/styles';

import Icon from "@material-ui/core/Icon";
import Dropzone from "react-dropzone";
import {InputField, PeriodPicker} from "@dhis2/d2-ui-core";
import Button from "@material-ui/core/Button";
import FormHelperText from "@material-ui/core/FormHelperText";
import Select from 'react-select';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from '@material-ui/core/FormGroup';

const styles = theme => ({
    block: {
        display: 'block',
        overflow: 'auto'
    },
    table: {
        // marginBottom:10
    }
});

const items = [{
    value: 'auto',
    label: 'auto',
}, {
    value: 'name',
    label: 'name',
}, {
    value: 'uid',
    label: 'uid',
}, {
    value: 'code',
    label: 'code',
}];

@inject('IntegrationStore')
@observer
class D2 extends React.Component {
    integrationStore = null;

    constructor(props) {
        super(props);

        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;

    }

    fileOptions = () => {
        return <td valign="top">
            <ol start="3">
                <li>
                    File Options
                    <br/>
                    <br/>
                    <table width="100%">
                        <tbody>
                        <tr>
                            <td>
                                <Select
                                    placeholder="Select sheet"
                                    value={this.integrationStore.dataSet.selectedSheet}
                                    options={this.integrationStore.dataSet.sheets}
                                    onChange={this.integrationStore.dataSet.setSelectedSheet}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <InputField
                                    label="Header row"
                                    type="number"
                                    fullWidth
                                    value={this.integrationStore.dataSet.headerRow}
                                    onChange={(value) => this.integrationStore.dataSet.handelHeaderRowChange(value)}
                                />
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <InputField
                                    label="Data start row"
                                    type="number"
                                    fullWidth
                                    value={this.integrationStore.dataSet.dataStartRow}
                                    onChange={(value) => this.integrationStore.dataSet.handelDataRowStartChange(value)}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <FormHelperText>For Excel, all sheets should have same header and data start
                                    rows</FormHelperText>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </li>
            </ol>

            <ol start="4">
                <li>
                    Organisation unit and period options
                    <table width="100%">
                        <tbody>
                        <tr>
                            <td>
                                {/*<pre>{JSON.stringify(this.integrationStore.dataSet.data, null, 2)}</pre>*/}
                                <Select
                                    placeholder="Organisation unit column"
                                    value={this.integrationStore.dataSet.orgUnitColumn}
                                    options={this.integrationStore.dataSet.columns}
                                    onChange={this.integrationStore.dataSet.setOrgUnitColumn}
                                />
                                <FormHelperText>For new tracked entities and events, this column will be
                                    used as organisation unit</FormHelperText>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <Select
                                    placeholder="Identifier scheme"
                                    value={this.integrationStore.dataSet.orgUnitStrategy}
                                    options={items}
                                    onChange={this.integrationStore.dataSet.setOrgUnitStrategy}
                                />
                                <FormHelperText>Organisation units will searched using uid by default
                                    please change if your organisation unit column is not
                                    uid</FormHelperText>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </li>
            </ol>
        </td>
    };

    fixedFileOptions = () => {
        let period = <PeriodPicker
            periodType={this.integrationStore.dataSet.periodType}
            onPickPeriod={(value) => this.integrationStore.dataSet.pick(value)}
        />;

        let organisation = <Select
            placeholder="Organisation"
            value={this.integrationStore.dataSet.organisation}
            options={this.integrationStore.dataSet.organisations}
            onChange={this.integrationStore.dataSet.setOrganisation}
        />;

        if (this.integrationStore.dataSet.periodInExcel) {
            period = <Select
                placeholder="Period Cell"
                value={this.integrationStore.dataSet.periodCell}
                options={this.integrationStore.dataSet.cells}
                onChange={this.integrationStore.dataSet.setPeriodCell}
            />
        }

        if (this.integrationStore.dataSet.organisationUnitInExcel) {
            organisation = <Select
                placeholder="Organisation Cell"
                value={this.integrationStore.dataSet.organisationCell}
                options={this.integrationStore.dataSet.cells}
                onChange={this.integrationStore.dataSet.setOrganisationCell}
            />
        }
        return <td valign="top">
            <ol start="3">
                <li>
                    File Options
                    <br/>
                    <br/>
                    <table width="100%">
                        <tbody>
                        <tr>
                            <td>
                                <Select
                                    placeholder="Select sheet"
                                    value={this.integrationStore.dataSet.selectedSheet}
                                    options={this.integrationStore.dataSet.sheets}
                                    onChange={this.integrationStore.dataSet.setSelectedSheet}
                                />
                            </td>
                        </tr>

                        <tr>
                            <td width="50%">
                                {organisation}
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <Select
                                    placeholder="Identifier scheme"
                                    value={this.integrationStore.dataSet.orgUnitStrategy}
                                    options={items}
                                    onChange={this.integrationStore.dataSet.setOrgUnitStrategy}
                                />
                            </td>
                        </tr>

                        <tr>
                            <td width="50%">
                                {period}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </li>
            </ol>
        </td>
    };

    attributeOptions = () => {
        if (this.integrationStore.dataSet.categoryCombo.categories.length > 0) {
            return <tr>
                <td colSpan="2">
                    <ol start="5">
                        <li>
                            Data Set Attribute Combination
                            <table width="100%">
                                <tbody>
                                <tr>
                                    {this.integrationStore.dataSet.categoryCombo.categories.map(category => {
                                        return <td key={category.id}>
                                            <Select
                                                placeholder={category.name + ' column'}
                                                value={category.mapping}
                                                options={this.integrationStore.dataSet.columns}
                                                onChange={category.setMapping}
                                            />
                                        </td>
                                    })}
                                </tr>
                                </tbody>
                            </table>
                        </li>
                    </ol>
                </td>
            </tr>
        }

        return null;

    };

    fixedAttributeOptions = () => {
        if (this.integrationStore.dataSet.categoryCombo.categories.length > 0) {
            if (this.integrationStore.dataSet.attributeCombosInExcel) {
                return <tr>
                    <td colSpan="2">
                        <ol start="4">
                            <li>
                                Data Set Attribute Combination
                                <table width="100%">
                                    <tbody>
                                    <tr>
                                        {this.integrationStore.dataSet.categoryCombo.categories.map(category => {
                                            return <td key={category.id}>
                                                <Select
                                                    placeholder={category.name}
                                                    value={category.mapping}
                                                    options={this.integrationStore.dataSet.cells}
                                                    onChange={category.setMapping}
                                                />
                                            </td>
                                        })}
                                    </tr>
                                    </tbody>
                                </table>
                            </li>
                        </ol>
                    </td>
                </tr>
            } else {
                return <tr>
                    <td colSpan="2">
                        <ol start="4">
                            <li>
                                Data Set Attribute Combination
                                <table width="100%">
                                    <tbody>
                                    <tr>
                                        {this.integrationStore.dataSet.categoryCombo.categories.map(category => {
                                            return <td key={category.id}>
                                                <Select
                                                    placeholder={category.name}
                                                    defaultValue={category.options[0]}
                                                    value={category.mapping}
                                                    options={category.options}
                                                    onChange={category.setMapping}
                                                />
                                            </td>
                                        })}
                                    </tr>
                                    </tbody>
                                </table>
                            </li>
                        </ol>
                    </td>

                </tr>
            }
        }

        return null;
    };

    dataSetColumns = () => {
        return <tr>
            <td colSpan="2">
                <ol start={this.integrationStore.dataSet.categoryCombo.categories.length > 0 ? 6 : 5}>
                    <li>
                        Import options
                        <table width="100%">
                            <tbody>
                            <tr>

                                <td>
                                    <Select
                                        placeholder="Data element column"
                                        value={this.integrationStore.dataSet.dataElementColumn}
                                        options={this.integrationStore.dataSet.columns}
                                        onChange={this.integrationStore.dataSet.setDataElementColumn}
                                    />
                                </td>
                                <td>
                                    <Select
                                        placeholder="Category option combination column"
                                        value={this.integrationStore.dataSet.categoryOptionComboColumn}
                                        options={this.integrationStore.dataSet.columns}
                                        onChange={this.integrationStore.dataSet.setCategoryOptionComboColumn}
                                    />

                                </td>
                                <td>
                                    <Select
                                        placeholder="Period column"
                                        value={this.integrationStore.dataSet.periodColumn}
                                        options={this.integrationStore.dataSet.columns}
                                        onChange={this.integrationStore.dataSet.setPeriodColumn}
                                    />
                                </td>
                                <td>
                                    <Select
                                        placeholder="Data value column"
                                        value={this.integrationStore.dataSet.dataValueColumn}
                                        options={this.integrationStore.dataSet.columns}
                                        onChange={this.integrationStore.dataSet.setDataValueColumn}
                                    />
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </li>
                </ol>
            </td>
        </tr>
    };

    fixedOptions = () => {


        return <tr>
            <td width="100%" colSpan="2">
                <ol start="3">
                    <li>
                        Import options
                        <table width="100%">
                            <tbody>

                            </tbody>
                        </table>
                    </li>
                </ol>
            </td>
        </tr>
    };

    render() {
        const {dataSet} = this.integrationStore;
        const {classes} = this.props;

        let columns = null;
        let fileOptions = null;
        let attributesCombos = null;

        let pullSection = null;

        if (dataSet.fixedExcel) {
            columns = this.fixedFileOptions();
            attributesCombos = this.fixedAttributeOptions();
        } else {
            fileOptions = this.dataSetColumns();
            columns = this.fileOptions();
            attributesCombos = this.attributeOptions();
            pullSection = <tr>
                <td valign="top" align="right">
                    <InputField
                        label="URL"
                        type="text"
                        fullWidth
                        value={dataSet.url}
                        onChange={(value) => dataSet.handelURLChange(value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!dataSet.url}
                        onClick={dataSet.pullData}>
                        Pull
                    </Button>
                </td>
            </tr>
        }

        return <div>
            {/*<pre>{JSON.stringify(dataSet, null, 2)}</pre>*/}
            <table width="100%">
                <tbody>
                <tr>
                    <td colSpan="2">
                        <ol start="1">
                            <li>
                                Options
                                <FormGroup row>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={dataSet.fixedExcel}
                                                onChange={dataSet.handleFixedExcel}
                                            />
                                        }
                                        label="Import from excel template"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={dataSet.periodInExcel}
                                                onChange={dataSet.handlePeriodInExcel}
                                                disabled={dataSet.disableCheckBox1}
                                            />
                                        }
                                        label="Period in the excel file"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={dataSet.organisationUnitInExcel}
                                                onChange={dataSet.handleOrganisationInExcel}
                                                disabled={dataSet.disableCheckBox2}
                                            />
                                        }
                                        label="Organisation unit in the excel file"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={dataSet.multipleOrganisations}
                                                onChange={dataSet.handleMultipleOrganisations}
                                                disabled={dataSet.disableCheckBox3}
                                            />
                                        }
                                        label="Multiple Organisation units"
                                    />

                                    {this.integrationStore.dataSet.categoryCombo.categories.length > 0 ?
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={dataSet.attributeCombosInExcel}
                                                    onChange={dataSet.handleAttributeCombosInExcel}
                                                    disabled={dataSet.disableCheckBox4}
                                                />
                                            }
                                            label="Data set attribute combo in the excel file"
                                        /> : null}


                                </FormGroup>
                            </li>

                        </ol>
                    </td>
                </tr>
                <tr>
                    <td valign="top" width="50%">
                        <ol start="2">
                            <li>
                                <table width="100%">
                                    <tbody>
                                    <tr>
                                        <td>Upload file to import or enter url</td>
                                    </tr>
                                    <tr>
                                        <td valign="top">
                                            <section>
                                                <div className="dropzone">
                                                    <Dropzone
                                                        accept=".csv, .xls, .xlsx"
                                                        onDrop={dataSet.onDrop}>
                                                        <p align="center">Drop files here</p>
                                                        <p align="center">
                                                            <Icon className={classes.icon} color="primary"
                                                                  style={{fontSize: 48}}>
                                                                add_circle
                                                            </Icon>
                                                        </p>
                                                        <p align="center"
                                                           style={{color: 'red'}}>{dataSet.uploadMessage}</p>
                                                    </Dropzone>
                                                </div>
                                            </section>
                                        </td>
                                    </tr>
                                    {pullSection}
                                    </tbody>
                                </table>
                            </li>
                        </ol>
                    </td>
                    {columns}
                </tr>
                {attributesCombos}
                {fileOptions}
                </tbody>
            </table>
        </div>
    }
}

export default withStyles(styles)(D2);
