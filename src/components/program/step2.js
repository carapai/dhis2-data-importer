import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Select from 'react-select';
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";

import red from '@material-ui/core/colors/red';
import {inject, observer} from "mobx-react";
import {InputField} from "@dhis2/d2-ui-core";
import FormGroup from '@material-ui/core/FormGroup';
import Grid from "@material-ui/core/Grid";
import Progress from "../progress";

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
class Step2 extends React.Component {

    integrationStore = null;

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

    render() {
        return <div>
            {this.integrationStore.program.templateType.value === '1' ? <Grid container spacing={8}>
                <Grid item xs={12}>
                    <Select
                        placeholder="Select sheet"
                        isClearable
                        isSearchable
                        value={this.integrationStore.program.selectedSheet}
                        options={this.integrationStore.program.sheets}
                        onChange={this.integrationStore.program.setSelectedSheet}
                    />
                    <InputField
                        label="Header row"
                        type="number"
                        fullWidth
                        value={this.integrationStore.program.headerRow}
                        onChange={(value) => this.integrationStore.program.handelHeaderRowChange(value)}
                    />
                    <InputField
                        label="Data start row"
                        type="number"
                        fullWidth
                        value={this.integrationStore.program.dataStartRow}
                        onChange={(value) => this.integrationStore.program.handelDataRowStartChange(value)}
                    />
                    <FormHelperText>For Excel, all sheets should have same header and data start
                        rows</FormHelperText>
                </Grid>
            </Grid> : null}

            <Grid container spacing={8}>
                <Grid item xs={6}>
                    <Select
                        placeholder="Organisation unit column"
                        isClearable
                        isSearchable
                        value={this.integrationStore.program.orgUnitColumn}
                        options={this.integrationStore.program.columns}
                        onChange={this.integrationStore.program.handleOrgUnitSelectChange}
                    />
                    <FormHelperText>For new tracked entities and events, this column will be
                        used as organisation unit</FormHelperText>
                </Grid>
                <Grid item xs={6}>
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
                </Grid>
            </Grid>

            <Grid container spacing={8}>
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
                                    <Select
                                        placeholder="Enrollment date column"
                                        isClearable
                                        isSearchable
                                        value={this.integrationStore.program.enrollmentDateColumn}
                                        disabled={!this.integrationStore.program.createNewEnrollments}
                                        options={this.integrationStore.program.columns}
                                        onChange={this.integrationStore.program.handleEnrollmentDateColumnSelectChange}
                                    />
                                    <FormHelperText>Should be a valid date<br/>&nbsp;</FormHelperText>
                                </Grid>

                                <Grid item xs={6}>
                                    <Select
                                        placeholder="Incident date column"
                                        isClearable
                                        isSearchable
                                        value={this.integrationStore.program.incidentDateColumn}
                                        disabled={!this.integrationStore.program.createNewEnrollments}
                                        options={this.integrationStore.program.columns}
                                        onChange={this.integrationStore.program.handleIncidentDateColumnSelectChange}
                                    />
                                    <FormHelperText>Should be a valid date<br/>&nbsp;</FormHelperText>
                                </Grid>
                            </Grid>

                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Progress open={this.integrationStore.program.dialogOpen}
                      onClose={this.integrationStore.program.closeDialog}/>
        </div>
    }
}

export default withStyles(styles, {withTheme: true})(Step2);
