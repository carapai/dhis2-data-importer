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
import TextField from '@material-ui/core/TextField';

import Radio from '@material-ui/core/Radio';
import Params from "./Params";
import Progress from "../progress";

import {createParam} from '../../utils'
import Grid from "@material-ui/core/Grid";
import {Tabs} from "antd";

const styles = theme => ({
    block: {
        display: 'block',
        overflow: 'auto'
    },
    table: {
        // marginBottom:10
    },
    formControl: {
        margin: theme.spacing.unit * 3,
    },
    group: {
        // margin: `${theme.spacing.unit}px 0`,
        width: 'auto',
        height: 'auto',
        display: 'flex',
        flexWrap: 'nowrap',
        flexDirection: 'row',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
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

const TabPane = Tabs.TabPane;


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
        return <Grid container spacing={8}>
            <Grid item xs={12}>
                <ol start="4">
                    <li>
                        File Options
                        <br/>
                        <br/>
                        <Select
                            placeholder="Select sheet"
                            value={this.integrationStore.dataSet.selectedSheet}
                            options={this.integrationStore.dataSet.sheets}
                            onChange={this.integrationStore.dataSet.setSelectedSheet}
                            isClearable
                            isSearchable
                        />

                        <InputField
                            label="Header row"
                            type="number"
                            fullWidth
                            value={this.integrationStore.dataSet.headerRow}
                            onChange={(value) => this.integrationStore.dataSet.handelHeaderRowChange(value)}
                        />
                        <InputField
                            label="Data start row"
                            type="number"
                            fullWidth
                            value={this.integrationStore.dataSet.dataStartRow}
                            onChange={(value) => this.integrationStore.dataSet.handelDataRowStartChange(value)}
                        />
                        <FormHelperText>For Excel, all sheets should have same header and data start
                            rows</FormHelperText>
                    </li>
                    <li>
                        Organization unit and period options
                        <Select
                            placeholder="Organisation unit column"
                            value={this.integrationStore.dataSet.orgUnitColumn}
                            options={this.integrationStore.dataSet.columns}
                            onChange={this.integrationStore.dataSet.setOrgUnitColumn}
                            isClearable
                            isSearchable
                        />
                        <FormHelperText>For new tracked entities and events, this column will be
                            used as organisation unit</FormHelperText>

                        <Select
                            placeholder="Identifier scheme"
                            value={this.integrationStore.dataSet.orgUnitStrategy}
                            options={items}
                            onChange={this.integrationStore.dataSet.setOrgUnitStrategy}
                            isClearable
                            isSearchable
                        />
                        <FormHelperText>Organisation units will searched using uid by default
                            please change if your organisation unit column is not
                            uid</FormHelperText>
                        <Checkbox checked={this.integrationStore.dataSet.completeDataSet}
                                  onChange={this.integrationStore.dataSet.onCheckCompleteDataSet}
                                  value="complete"/> Complete Data Sets
                    </li>
                </ol>
            </Grid>
            <Grid item xs={6}>
                <ol start="5">

                </ol>
            </Grid>
        </Grid>
    };

    fixedFileOptions = () => {
        let period = <PeriodPicker
            periodType={this.integrationStore.dataSet.periodType}
            onPickPeriod={(value) => this.integrationStore.dataSet.pick(value)}
        />;

        let orgStrategy = null;

        let organisation = <Select
            placeholder="Organisation"
            value={this.integrationStore.dataSet.organisation}
            options={this.integrationStore.dataSet.organisations}
            onChange={this.integrationStore.dataSet.setOrganisation}
            isClearable
            isSearchable
        />;

        if (this.integrationStore.dataSet.periodInExcel) {
            period = <Select
                placeholder="Period Cell"
                value={this.integrationStore.dataSet.periodColumn}
                options={this.integrationStore.dataSet.cells}
                onChange={this.integrationStore.dataSet.setPeriodColumn}
                isClearable
                isSearchable
            />
        }

        if (this.integrationStore.dataSet.organisationUnitInExcel) {
            organisation = <Select
                placeholder="Organisation Cell"
                value={this.integrationStore.dataSet.organisationCell}
                options={this.integrationStore.dataSet.cells}
                onChange={this.integrationStore.dataSet.setOrganisationCell}
                isClearable
                isSearchable
            />;

            orgStrategy = <Select
                placeholder="Identifier scheme"
                value={this.integrationStore.dataSet.orgUnitStrategy}
                options={items}
                onChange={this.integrationStore.dataSet.setOrgUnitStrategy}
                isClearable
                isSearchable
            />

        }


        return <ol start="4">
            <li>
                File Options
                <Select
                    placeholder="Select sheet"
                    value={this.integrationStore.dataSet.selectedSheet}
                    options={this.integrationStore.dataSet.sheets}
                    onChange={this.integrationStore.dataSet.setSelectedSheet}
                    isClearable
                    isSearchable
                />
                <br/>
                {organisation}
                <br/>
                {orgStrategy}
                <br/>
                {period}

            </li>
        </ol>
    };

    dynamicFileOptions = () => {

        let organisation = <Select
            placeholder="Organisation column"
            value={this.integrationStore.dataSet.orgUnitColumn}
            options={this.integrationStore.dataSet.cellColumns}
            onChange={this.integrationStore.dataSet.setOrgUnitColumn}
            isClearable
            isSearchable
        />;

        let period = <Select
            placeholder="Period column"
            value={this.integrationStore.dataSet.periodColumn}
            options={this.integrationStore.dataSet.cellColumns}
            onChange={this.integrationStore.dataSet.setPeriodColumn}
            isClearable
            isSearchable
        />;


        let orgStrategy = <Select
            placeholder="Identifier scheme"
            value={this.integrationStore.dataSet.orgUnitStrategy}
            options={items}
            onChange={this.integrationStore.dataSet.setOrgUnitStrategy}
            isClearable
            isSearchable
        />;

        return <ol start="4">
            <li>
                File Options
                <br/>
                <br/>
                <Grid item xs={6}>

                    <Select
                        placeholder="Select sheet"
                        value={this.integrationStore.dataSet.selectedSheet}
                        options={this.integrationStore.dataSet.sheets}
                        onChange={this.integrationStore.dataSet.setSelectedSheet}
                        isClearable
                        isSearchable
                    />
                    <InputField
                        label="Data start row"
                        type="number"
                        fullWidth
                        value={this.integrationStore.dataSet.dataStartRow}
                        onChange={(value) => this.integrationStore.dataSet.handelDataRowStartChange(value)}
                    />
                    <Select
                        placeholder="Data start column"
                        value={this.integrationStore.dataSet.dataStartColumn}
                        options={this.integrationStore.dataSet.cellColumns}
                        onChange={this.integrationStore.dataSet.setDataStartColumn}
                        isClearable
                        isSearchable
                    />
                    <FormHelperText>If your data elements are alphabetically arranged please select column
                        where data starts to guess columns</FormHelperText>
                    {organisation}
                    <br/>
                    {orgStrategy}
                    <br/>
                    {period}
                </Grid>
            </li>
        </ol>
    };

    dynamicFileOptions2 = () => {

        let organisation = <Select
            placeholder="Organisation column"
            value={this.integrationStore.dataSet.orgUnitColumn}
            options={this.integrationStore.dataSet.cellColumns}
            onChange={this.integrationStore.dataSet.setOrgUnitColumn}
            isClearable
            isSearchable
        />;

        let period = <Select
            placeholder="Period column"
            value={this.integrationStore.dataSet.periodColumn}
            options={this.integrationStore.dataSet.cellColumns}
            onChange={this.integrationStore.dataSet.setPeriodColumn}
            isClearable
            isSearchable
        />;


        let orgStrategy = <Select
            placeholder="Identifier scheme"
            value={this.integrationStore.dataSet.orgUnitStrategy}
            options={items}
            onChange={this.integrationStore.dataSet.setOrgUnitStrategy}
            isClearable
            isSearchable
        />;

        return <ol start="4">
            <li>
                File Options

                <Select
                    placeholder="Select sheet"
                    value={this.integrationStore.dataSet.selectedSheet}
                    options={this.integrationStore.dataSet.sheets}
                    onChange={this.integrationStore.dataSet.setSelectedSheet}
                    isClearable
                    isSearchable
                />
                <br/>
                <InputField
                    label="Data Element row"
                    type="number"
                    fullWidth
                    value={this.integrationStore.dataSet.headerRow}
                    onChange={(value) => this.integrationStore.dataSet.handelHeaderRowChange(value)}
                />
                <br/>
                <InputField
                    label="Data start row"
                    type="number"
                    fullWidth
                    value={this.integrationStore.dataSet.dataStartRow}
                    onChange={(value) => this.integrationStore.dataSet.handelDataRowStartChange(value)}
                />
                <br/>
                <Select
                    placeholder="Data start column"
                    value={this.integrationStore.dataSet.dataStartColumn}
                    options={this.integrationStore.dataSet.cellColumns}
                    onChange={this.integrationStore.dataSet.setDataStartColumn}
                    isClearable
                    isSearchable
                />
                <FormHelperText>If your data elements are alphabetically arranged please select column
                    where data starts to guess columns</FormHelperText>
                <br/>
                {organisation}
                <br/>
                {orgStrategy}
                <br/>
                {period}
            </li>
        </ol>
    };

    attributeOptions = () => {
        if (this.integrationStore.dataSet.categoryCombo.categories.length > 0) {
            return <ol start="6">
                <li>
                    Data Set Attribute Combination
                    <Grid container spacing={8}>

                        {this.integrationStore.dataSet.categoryCombo.categories.map(category => {
                            return <Grid key={category.id} item
                                         xs={12 / this.integrationStore.dataSet.categoryCombo.categories.length}>
                                <Select
                                    placeholder={category.name + ' column'}
                                    value={category.mapping}
                                    options={this.integrationStore.dataSet.columns}
                                    onChange={category.setMapping}
                                    isClearable
                                    isSearchable
                                />
                            </Grid>
                        })}
                    </Grid>
                </li>
            </ol>
        }
        return null;
    };


    dynamicAttributeOptions = () => {
        if (this.integrationStore.dataSet.categoryCombo.categories.length > 0) {
            return <ol start="5">
                <li>
                    Data Set Attribute Combination
                    <Grid container spacing={8}>
                        {this.integrationStore.dataSet.categoryCombo.categories.map(category => {
                            return <Grid key={category.id} item
                                         xs={12 / this.integrationStore.dataSet.categoryCombo.categories.length}>
                                <Select
                                    placeholder={category.name + ' column'}
                                    value={category.mapping}
                                    options={this.integrationStore.dataSet.cellColumns}
                                    onChange={category.setMapping}
                                    isClearable
                                    isSearchable
                                />
                            </Grid>
                        })}
                    </Grid>
                </li>
            </ol>
        }

        return null;

    };

    fixedAttributeOptions = () => {
        if (this.integrationStore.dataSet.categoryCombo.categories.length > 0) {
            if (this.integrationStore.dataSet.attributeCombosInExcel) {
                return <ol start="5">
                    <li>
                        Data Set Attribute Combination
                        <Grid container spacing={8}>
                            {this.integrationStore.dataSet.categoryCombo.categories.map(category => {
                                return <Grid key={category.id}
                                             xs={12 / this.integrationStore.dataSet.categoryCombo.categories.length}>
                                    <Select
                                        placeholder={category.name}
                                        value={category.mapping}
                                        options={this.integrationStore.dataSet.cells}
                                        onChange={category.setMapping}
                                        isClearable
                                        isSearchable
                                    />
                                </Grid>
                            })}
                        </Grid>
                    </li>
                </ol>
            } else {
                return <ol start="5">
                    <li>
                        Data Set Attribute Combination
                        <Grid container spacing={8}>
                            {this.integrationStore.dataSet.categoryCombo.categories.map(category => {
                                return <Grid item key={category.id}
                                             xs={12 / this.integrationStore.dataSet.categoryCombo.categories.length}>
                                    <Select
                                        placeholder={category.name}
                                        defaultValue={category.options[0]}
                                        value={category.mapping}
                                        options={category.options}
                                        onChange={category.setMapping}
                                        isClearable
                                        isSearchable
                                    />
                                </Grid>
                            })}

                        </Grid>
                    </li>
                </ol>
            }
        }
        return null;
    };

    dataSetColumns = () => {
        return <ol start={this.integrationStore.dataSet.categoryCombo.categories.length > 0 ? 7 : 6}>
            <li>
                Import options
                <Grid spacing={8} container>
                    <Grid xs={3} item>
                        <Select
                            placeholder="Data element column"
                            value={this.integrationStore.dataSet.dataElementColumn}
                            options={this.integrationStore.dataSet.columns}
                            onChange={this.integrationStore.dataSet.setDataElementColumn}
                            isClearable
                            isSearchable
                        />
                    </Grid>
                    <Grid xs={3} item>
                        <Select
                            placeholder="Category option combination column"
                            value={this.integrationStore.dataSet.categoryOptionComboColumn}
                            options={this.integrationStore.dataSet.columns}
                            onChange={this.integrationStore.dataSet.setCategoryOptionComboColumn}
                            isClearable
                            isSearchable
                        />
                    </Grid>
                    <Grid xs={3} item>
                        <Select
                            placeholder="Period column"
                            value={this.integrationStore.dataSet.periodColumn}
                            options={this.integrationStore.dataSet.columns}
                            onChange={this.integrationStore.dataSet.setPeriodColumn}
                            isClearable
                            isSearchable
                        />
                    </Grid>
                    <Grid xs={3} item>
                        <Select
                            placeholder="Data value column"
                            value={this.integrationStore.dataSet.dataValueColumn}
                            options={this.integrationStore.dataSet.columns}
                            onChange={this.integrationStore.dataSet.setDataValueColumn}
                            isClearable
                            isSearchable
                        />
                    </Grid>
                </Grid>
            </li>
        </ol>
    };


    render() {
        const {dataSet} = this.integrationStore;
        const {classes} = this.props;

        let columns = null;
        let fileOptions = null;
        let attributesCombos = null;

        let pullSection = null;

        const uploadSection = <section>
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
                        <p align="center">{dataSet.fileName}</p>
                        <p align="center"
                           style={{color: 'red'}}>{dataSet.uploadMessage}</p>
                    </Dropzone>
                </div>
            </section>
        ;

        if (dataSet.templateType === "1") {

            fileOptions = this.dataSetColumns();
            columns = this.fileOptions();
            attributesCombos = this.attributeOptions();

            pullSection = <div>
                <Grid container spacing={8}>
                    <Grid item xs={12}>
                        <InputField
                            label="URL"
                            type="text"
                            fullWidth
                            value={dataSet.url}
                            onChange={(value) => dataSet.handelURLChange(value)}/>

                    </Grid>
                </Grid>

                <Grid container spacing={8}>
                    <Grid item xs={6}>
                        <InputField
                            label="Username"
                            type="text"
                            fullWidth
                            value={dataSet.username}
                            onChange={(value) => dataSet.setUsername(value)}/>
                    </Grid>
                    <Grid item xs={6}>
                        <InputField
                            label="Password"
                            type="text"
                            fullWidth
                            value={dataSet.password}
                            onChange={(value) => this.integrationStore.dataSet.setPassword(value)}/>
                    </Grid>
                </Grid>
                <Grid container spacing={8}>
                    <Grid item xs={6}>
                        <InputField
                            label="Response key"
                            type="text"
                            fullWidth
                            value={this.integrationStore.dataSet.responseKey}
                            onChange={(value) => this.integrationStore.dataSet.setResponseKey(value)}/>
                        <FormHelperText>If the response is not an array, specify the key which holds the
                            array</FormHelperText>
                    </Grid>
                </Grid>

                <Grid container spacing={8}>
                    <Grid item xs={12}>
                        <Checkbox checked={this.integrationStore.dataSet.isDhis2}
                                  onChange={this.integrationStore.dataSet.onCheckIsDhis2} value="checked"/> From
                        DHIS2

                        {this.integrationStore.dataSet.isDhis2 ? <div>
                                <Select
                                    placeholder="Select data set to import"
                                    value={this.integrationStore.dataSet.selectedDataSet}
                                    options={this.integrationStore.dataSet.dhis2DataSets}
                                    onChange={this.integrationStore.dataSet.setDhis2DataSetChange}
                                    isClearable
                                    isSearchable
                                />
                                <br/>
                                <Select
                                    placeholder="Organisation unit level"
                                    value={this.integrationStore.dataSet.currentLevel}
                                    options={this.integrationStore.dataSet.levels}
                                    onChange={this.integrationStore.dataSet.setCurrentLevel}
                                    isClearable
                                    isSearchable
                                />
                                <br/>

                                <Checkbox checked={this.integrationStore.dataSet.multiplePeriods}
                                          onChange={this.integrationStore.dataSet.onCheckMultiplePeriods}
                                          value="checked"/> Multiple Periods

                                {this.integrationStore.dataSet.multiplePeriods ? <div>
                                    <Grid container spacing={8}>
                                        <Grid item xs={6}>
                                            <TextField
                                                id="startDate"
                                                label="Start Date"
                                                type="date"
                                                value={this.integrationStore.dataSet.startPeriod}
                                                className={classes.textField}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                onChange={this.integrationStore.dataSet.handleStartPeriodChange}
                                            />
                                        </Grid>

                                        <Grid item xs={6}>
                                            <TextField
                                                id="endDate"
                                                label="End Date"
                                                type="date"
                                                value={this.integrationStore.dataSet.endPeriod}
                                                className={classes.textField}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                onChange={this.integrationStore.dataSet.handleEndPeriodChange}
                                            />
                                        </Grid>
                                    </Grid>
                                </div> : <div>
                                    <PeriodPicker
                                        periodType={this.integrationStore.dataSet.periodType}
                                        onPickPeriod={(value) => this.integrationStore.dataSet.replaceParam(createParam({
                                            param: 'period',
                                            value: value
                                        }))}
                                    />
                                </div>}
                            </div>
                            : null}

                        <Params/>

                    </Grid>
                </Grid>
                <br/>
                <br/>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!dataSet.url || dataSet.isDhis2}
                    onClick={dataSet.pullData}>
                    Pull
                </Button>
            </div>

        } else if (dataSet.templateType === "2") {
            columns = this.fixedFileOptions();
            attributesCombos = this.fixedAttributeOptions();


        } else if (dataSet.templateType === "3") {
            columns = this.dynamicFileOptions();
            attributesCombos = this.dynamicAttributeOptions();

        } else if (dataSet.templateType === "4") {
            columns = this.dynamicFileOptions2();
            attributesCombos = this.dynamicAttributeOptions();
        }

        return <div>
            <Grid container spacing={8}>
                <Grid item xs={6}>
                    <ol start="1">
                        <li>
                            Choose Import Type
                            <FormGroup row>
                                <FormControlLabel
                                    control={
                                        <Radio
                                            checked={dataSet.templateType === "1"}
                                            onChange={dataSet.handleRadioChange}
                                            value="1"
                                        />
                                    }
                                    label="Excel/CSV/API Line Listing"
                                />

                                <FormControlLabel
                                    control={
                                        <Radio
                                            checked={dataSet.templateType === "4"}
                                            onChange={dataSet.handleRadioChange}
                                            value="4"
                                        />
                                    }
                                    label="Excel Tabular Data"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio
                                            checked={dataSet.templateType === "2"}
                                            onChange={dataSet.handleRadioChange}
                                            value="2"
                                        />
                                    }
                                    label="Excel Form"
                                />

                            </FormGroup>
                        </li>

                    </ol>
                </Grid>
                <Grid item xs={6}>
                    <ol start="2">
                        <li>
                            Options
                            <FormGroup row>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={dataSet.periodInExcel}
                                            onChange={dataSet.handlePeriodInExcel}
                                            disabled={dataSet.disableCheckBox1}
                                        />
                                    }
                                    label="Period provided"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={dataSet.organisationUnitInExcel}
                                            onChange={dataSet.handleOrganisationInExcel}
                                            disabled={dataSet.disableCheckBox2}
                                        />
                                    }
                                    label="Organisation provided"
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
                                        label="Dataset attribute combo provided"
                                    /> : null}


                            </FormGroup>
                        </li>

                    </ol>
                </Grid>
            </Grid>
            <Grid container spacing={8}>
                <Grid item xs={6}>
                    <ol start="3">
                        <li>
                            Select Data Source
                            <Tabs defaultActiveKey="1">
                                <TabPane tab="Upload Excel/CSV" key="1">
                                    {uploadSection}
                                </TabPane>
                                <TabPane tab="Import from API" key="2">
                                    {pullSection}
                                </TabPane>
                            </Tabs>
                        </li>
                    </ol>
                </Grid>
                <Grid item xs={6}>
                    {columns}
                </Grid>
            </Grid>

            {attributesCombos}
            {fileOptions}
            <Progress open={this.integrationStore.dataSet.dialogOpen}
                      onClose={this.integrationStore.dataSet.closeDialog}/>
        </div>
    }
}

export default withStyles(styles)(D2);
