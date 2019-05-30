import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Select from 'react-select';
import Checkbox from "@material-ui/core/Checkbox";
import FormHelperText from "@material-ui/core/FormHelperText";

import red from '@material-ui/core/colors/red';
import {inject, observer} from "mobx-react";
import {InputField} from "@dhis2/d2-ui-core";
import FormGroup from '@material-ui/core/FormGroup';
import Grid from "@material-ui/core/Grid";
// import {Table} from 'antd';
import Progress from "../progress";

import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import customStyles from "../customStyles";

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    icon: {
        margin: theme.spacing.unit * 2,
    },
    iconHover: {
        margin: theme.spacing.unit * 2,
        '&:hover': {
            color: red[800],
        },
    },
});

// const items = [{
//     value: 'auto',
//     label: 'auto',
// }, {
//     value: 'name',
//     label: 'name',
// }, {
//     value: 'uid',
//     label: 'uid',
// }, {
//     value: 'code',
//     label: 'code',
// }];


@inject('IntegrationStore')
@observer
class Step2 extends React.Component {

    integrationStore = null;

    // columns = [
    //     {
    //         title: 'Source Organisation Units',
    //         dataIndex: 'name',
    //         width: 150,
    //     },
    //     {
    //         title: 'Destination Organisation Units',
    //         render: (text, row, index) => {
    //             return <Select
    //                 placeholder="Aggregation Level"
    //                 value={row.mapping}
    //                 options={this.integrationStore.program.organisationUnits.map(ui => {
    //                     return {label: ui.name, value: ui.id}
    //                 })}
    //                 onChange={row.setMapping}
    //                 isClearable
    //                 isSearchable
    //                 styles={customStyles}
    //             />;
    //         },
    //         width: 150,
    //     }
    // ];

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    componentDidMount() {
        if (this.integrationStore.program.templateType && this.integrationStore.program.templateType.value === '2') {
            this.integrationStore.program.pullData();
        }
    }


    organisationUnitMapping = () => {
        return <div>
            {/*<Table dataSource={this.integrationStore.sourceProgramUnits} columns={this.columns} scroll={{y: 240}} pagination={false}/>*/}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Source Organisation Units
                        </TableCell>
                        <TableCell>
                            Destination Organisation Units

                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>

                    {this.integrationStore.sourceProgramUnits.map((u, i) => <TableRow hover key={i}>
                        <TableCell>
                            {u.name}
                        </TableCell>
                        <TableCell>
                            <Select
                                placeholder="Aggregation Level"
                                value={u.mapping}
                                options={this.integrationStore.program.organisationUnits.map(ui => {
                                    return {label: ui.name, value: ui.id}
                                })}
                                onChange={u.setMapping}
                                isClearable
                                isSearchable
                                styles={customStyles}
                            />
                        </TableCell>
                    </TableRow>)}

                </TableBody>
            </Table>

            <TablePagination
                component="div"
                count={this.integrationStore.program.sourceOrganisationUnits.length}
                rowsPerPage={this.integrationStore.paging['step25']['rowsPerPage']}
                page={this.integrationStore.paging['step25']['page']}
                backIconButtonProps={{
                    'aria-label': 'Previous Page',
                }}
                nextIconButtonProps={{
                    'aria-label': 'Next Page',
                }}
                onChangePage={this.integrationStore.handleChangeElementPage('step25')}
                onChangeRowsPerPage={this.integrationStore.handleChangeElementRowsPerPage('step25')}
            />
        </div>
    };

    render() {
        return <div>
            {this.integrationStore.program.templateType.value === '1' ? <div>
                <Grid container spacing={8}>
                    <Grid item xs={12}>
                        <span style={{fontWeight: 'bold'}}>Select sheet</span>
                        <Select
                            placeholder="Select sheet"
                            isClearable
                            isSearchable
                            value={this.integrationStore.program.selectedSheet}
                            options={this.integrationStore.program.sheets}
                            onChange={this.integrationStore.program.setSelectedSheet}
                            styles={customStyles}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={8}>
                    <Grid item xs={6}>
                        <InputField
                            label="Header row"
                            type="number"
                            fullWidth
                            value={this.integrationStore.program.headerRow}
                            onChange={(value) => this.integrationStore.program.handelHeaderRowChange(value)}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <InputField
                            label="Data start row"
                            type="number"
                            fullWidth
                            value={this.integrationStore.program.dataStartRow}
                            onChange={(value) => this.integrationStore.program.handelDataRowStartChange(value)}
                        />
                    </Grid>
                </Grid>
            </div> : null}
            <br/>
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <span style={{fontWeight: 'bold'}}>Select organisation unit column</span>
                    <Select
                        placeholder="Organisation unit column"
                        isClearable
                        isSearchable
                        value={this.integrationStore.program.orgUnitColumn}
                        options={this.integrationStore.program.columns}
                        onChange={this.integrationStore.program.handleOrgUnitSelectChange}
                        styles={customStyles}
                    />
                    <FormHelperText>For new tracked entities and events, this column will be
                        used as organisation unit</FormHelperText>
                </Grid>
                {/*<Grid item xs={6}>
                    <span style={{fontWeight:'bold'}}>Select identifier scheme</span>
                    <Select
                        placeholder="Identifier scheme"
                        isClearable
                        isSearchable
                        value={this.integrationStore.program.orgUnitStrategy}
                        options={items}
                        onChange={this.integrationStore.program.handleOrgUnitStrategySelectChange}
                    />
                    <FormHelperText>Organisation units will searched using uid by default
                        please change if your organisation unit column is not
                        uid</FormHelperText>
                </Grid>*/}
            </Grid>
            <br/>
            {this.integrationStore.program.isTracker ? <Grid container spacing={8}>
                <Grid item xs={12}>
                    <Grid container spacing={8}>
                        <Grid item xs={12}>
                            <FormGroup row>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            disabled={!this.integrationStore.program.isTracker}
                                            checked={this.integrationStore.program.createEntities}
                                            onChange={this.integrationStore.program.handleCreateEntitiesCheck}
                                            value="3"
                                        />}
                                    label="Create new entities"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            disabled={!this.integrationStore.program.isTracker}
                                            checked={this.integrationStore.program.updateEntities}
                                            onChange={this.integrationStore.program.handleUpdateEntitiesCheck}
                                            value="4"
                                        />}
                                    label="Update entities"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            disabled={!this.integrationStore.program.isTracker}
                                            checked={this.integrationStore.program.createNewEnrollments}
                                            onChange={this.integrationStore.program.handleCreateNewEnrollmentsCheck}
                                            value="5"
                                        />}
                                    label="Create new enrollments"
                                />
                            </FormGroup>
                        </Grid>
                    </Grid>
                    <Grid container spacing={8}>
                        <Grid item xs={12}>
                            <Grid container spacing={8}>
                                <Grid item xs={6}>
                                    <span style={{fontWeight: 'bold'}}>Select enrollment date column</span>
                                    <Select
                                        placeholder="Enrollment date column"
                                        isClearable
                                        isSearchable
                                        value={this.integrationStore.program.enrollmentDateColumn}
                                        disabled={!this.integrationStore.program.createNewEnrollments}
                                        options={this.integrationStore.program.columns}
                                        onChange={this.integrationStore.program.handleEnrollmentDateColumnSelectChange}
                                        styles={customStyles}
                                    />
                                    <FormHelperText>Should be a valid date<br/>&nbsp;</FormHelperText>
                                </Grid>

                                <Grid item xs={6}>
                                    <span style={{fontWeight: 'bold'}}>Select incident date column</span>
                                    <Select
                                        placeholder="Incident date column"
                                        isClearable
                                        isSearchable
                                        value={this.integrationStore.program.incidentDateColumn}
                                        disabled={!this.integrationStore.program.createNewEnrollments}
                                        options={this.integrationStore.program.columns}
                                        onChange={this.integrationStore.program.handleIncidentDateColumnSelectChange}
                                        styles={customStyles}
                                    />
                                    <FormHelperText>Should be a valid date<br/>&nbsp;</FormHelperText>
                                </Grid>
                            </Grid>

                        </Grid>
                    </Grid>
                </Grid>
            </Grid> : null}
            <br/>
            <span style={{fontWeight: 'bold'}}>Organisation unit mapping</span>
            {this.organisationUnitMapping()}
            <Progress open={this.integrationStore.program.dialogOpen}
                      onClose={this.integrationStore.program.closeDialog}/>
        </div>
    }
}

export default withStyles(styles, {withTheme: true})(Step2);
