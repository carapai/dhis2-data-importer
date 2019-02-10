import {inject, observer} from 'mobx-react';
import React from 'react';
import {withStyles} from '@material-ui/core/styles';

import Icon from "@material-ui/core/Icon";
import Dropzone from "react-dropzone";
import {InputField} from "@dhis2/d2-ui-core";
import FormHelperText from "@material-ui/core/FormHelperText";
import Select from 'react-select';

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

    dynamicFileOptions2 = () => {

        let organisation = <Select
            placeholder="Organisation column"
            value={this.integrationStore.dataSet.orgUnitColumn}
            options={this.integrationStore.dataSet.cellColumns}
            onChange={this.integrationStore.dataSet.setOrgUnitColumn}
        />;

        let period = <Select
            placeholder="Period column"
            value={this.integrationStore.dataSet.periodColumn}
            options={this.integrationStore.dataSet.cellColumns}
            onChange={this.integrationStore.dataSet.setPeriodColumn}
        />;


        let orgStrategy = <tr>
            <td>
                <Select
                    placeholder="Identifier scheme"
                    value={this.integrationStore.dataSet.orgUnitStrategy}
                    options={items}
                    onChange={this.integrationStore.dataSet.setOrgUnitStrategy}
                />
            </td>
        </tr>;

        return <td valign="top">
            <ol start="2">
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
                                    label="Data Element row"
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
                                <Select
                                    placeholder="Data start column"
                                    value={this.integrationStore.dataSet.dataStartColumn}
                                    options={this.integrationStore.dataSet.cellColumns}
                                    onChange={this.integrationStore.dataSet.setDataStartColumn}
                                />
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <FormHelperText>If your data elements are alphabetically arranged please select column
                                    where data starts to guess columns</FormHelperText>
                            </td>
                        </tr>

                        <tr>
                            <td width="50%">
                                {organisation}
                            </td>
                        </tr>

                        {orgStrategy}

                        <tr>
                            <td width="50%">
                                {period}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <Select
                                    placeholder="Type of support column"
                                    value={this.integrationStore.dataSet.typeOfSupportColumn}
                                    options={this.integrationStore.dataSet.cellColumns}
                                    onChange={this.integrationStore.dataSet.setTypeOfSupportColumn}
                                />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </li>
            </ol>
        </td>
    };



    dynamicAttributeOptions = () => {
        if (this.integrationStore.dataSet.categoryCombo.categories.length > 0) {
            return <tr>
                <td colSpan="2">
                    <ol start="3">
                        <li>
                            Data Set Attribute Combination & Type of support
                            <table width="100%">
                                <tbody>
                                <tr>
                                    {this.integrationStore.dataSet.categoryCombo.categories.map(category => {
                                        return <td key={category.id}>
                                            <Select
                                                placeholder={category.name + ' column'}
                                                value={category.mapping}
                                                options={this.integrationStore.dataSet.cellColumns}
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


    render() {
        const {dataSet} = this.integrationStore;
        const {classes} = this.props;

        let columns = this.dynamicFileOptions2();
        let attributesCombos = this.dynamicAttributeOptions();

        return <div>
            <table width="100%">
                <tbody>
                <tr>
                    <td valign="top" width="50%">
                        <ol start="1">
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
                                    </tbody>
                                </table>
                            </li>
                        </ol>
                    </td>
                    {columns}
                </tr>
                {attributesCombos}
                </tbody>
            </table>
        </div>
    }
}

export default withStyles(styles)(D2);
