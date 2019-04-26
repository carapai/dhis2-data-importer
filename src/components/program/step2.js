import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Dropzone from 'react-dropzone'
import Select from 'react-select';
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import Icon from '@material-ui/core/Icon';
import {inject, observer} from "mobx-react";
import {InputField} from "@dhis2/d2-ui-core";
import FormGroup from '@material-ui/core/FormGroup';
import Params from "./Params";
import Grid from "@material-ui/core/Grid";
import {Tabs} from 'antd';

const TabPane = Tabs.TabPane;

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

        this.state = {
            value: 0,
        };
    }

    handleChange = (event, value) => {
        this.setState({value});
    };

    handleChangeIndex = index => {
        this.setState({value: index});
    };

    render() {
        let progress = '';
        const {classes} = this.props;
        let pull = '';

        const {program} = this.integrationStore;

        if (program.uploaded) {
            progress = <LinearProgress variant="determinate" value={program.uploaded}/>;
        }

        if (program.pulling) {
            pull = <LinearProgress color="secondary"/>
        }

        return <div>
            {pull}
            {progress}
            {program.uploaded}

            <Grid container spacing={8}>
                <Grid item xs={6}>
                    <ol start="1">
                        <li>
                            Select Data Source
                            <div className={classes.root}>
                                <Tabs defaultActiveKey="1">
                                    <TabPane tab="Upload Excel/CSV" key="1">
                                        <section>
                                            <div className="dropzone">
                                                <Dropzone
                                                    accept=".csv, .xls, .xlsx"
                                                    onDrop={program.onDrop}>
                                                    <p align="center">Drop files here</p>
                                                    <p align="center">
                                                        <Icon className={classes.icon} color="primary"
                                                              style={{fontSize: 48}}>
                                                            add_circle
                                                        </Icon>
                                                    </p>
                                                    <p align="center">{program.fileName}</p>
                                                    <p align="center"
                                                       style={{color: 'red'}}>{program.uploadMessage}</p>
                                                </Dropzone>
                                            </div>
                                        </section>
                                    </TabPane>
                                    <TabPane tab="Import from API" key="2">
                                        <InputField
                                            label="URL"
                                            type="text"
                                            fullWidth
                                            value={program.url}
                                            onChange={(value) => program.handelURLChange(value)}
                                        />
                                        <InputField
                                            label="Response key"
                                            type="text"
                                            fullWidth
                                            value={program.responseKey}
                                            onChange={(value) => program.setResponseKey(value)}/>

                                        <InputField
                                            label="Username"
                                            type="text"
                                            fullWidth
                                            value={program.username}
                                            onChange={(value) => program.setUsername(value)}/>

                                        <InputField
                                            label="Password"
                                            type="text"
                                            fullWidth
                                            value={program.password}
                                            onChange={(value) => program.setPassword(value)}/>

                                        <Params/>

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            disabled={!program.url}
                                            onClick={program.pullData}>
                                            Pull
                                        </Button>
                                    </TabPane>
                                </Tabs>
                            </div>
                        </li>
                    </ol>
                </Grid>
                <Grid item xs={6}>
                    <Grid container spacing={8}>
                        <Grid item xs={12}>
                            <ol start="2">
                                <li>
                                    File Options
                                    <Select
                                        placeholder="Select sheet"
                                        isClearable
                                        isSearchable
                                        value={program.selectedSheet}
                                        options={program.sheets}
                                        onChange={program.setSelectedSheet}
                                    />
                                    <InputField
                                        label="Header row"
                                        type="number"
                                        fullWidth
                                        value={program.headerRow}
                                        onChange={(value) => program.handelHeaderRowChange(value)}
                                    />
                                    <InputField
                                        label="Data start row"
                                        type="number"
                                        fullWidth
                                        value={program.dataStartRow}
                                        onChange={(value) => program.handelDataRowStartChange(value)}
                                    />
                                    <FormHelperText>For Excel, all sheets should have same header and data start
                                        rows</FormHelperText>
                                </li>
                            </ol>
                        </Grid>
                    </Grid>

                    <Grid container spacing={8}>
                        <Grid item xs={12}>
                            <ol start="3">
                                <li>
                                    Organisation unit options
                                    <Select
                                        placeholder="Organisation unit column"
                                        isClearable
                                        isSearchable
                                        value={program.orgUnitColumn}
                                        options={program.columns}
                                        onChange={program.handleOrgUnitSelectChange}
                                    />
                                    <FormHelperText>For new tracked entities and events, this column will be
                                        used as organisation unit</FormHelperText>
                                    <Select
                                        placeholder="Identifier scheme"
                                        isClearable
                                        isSearchable
                                        value={program.orgUnitStrategy}
                                        options={items}
                                        onChange={program.handleOrgUnitStrategySelectChange}
                                    />
                                    <FormHelperText>Organisation units will searched using uid by default
                                        please change if your organisation unit column is not
                                        uid</FormHelperText>
                                </li>
                            </ol>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <ol start="4">
                        <li>
                            Enrollments & Entities Options
                            <Grid container spacing={8}>
                                <Grid item xs={12}>
                                    <FormGroup row>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    disabled={!program.isTracker}
                                                    checked={program.createEntities}
                                                    onChange={program.handleCreateEntitiesCheck}
                                                    value="3"
                                                />}
                                            label="Create new entities"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    disabled={!program.isTracker}
                                                    checked={program.updateEntities}
                                                    onChange={program.handleUpdateEntitiesCheck}
                                                    value="4"
                                                />}
                                            label="Update entities"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    disabled={!program.isTracker}
                                                    checked={program.createNewEnrollments}
                                                    onChange={program.handleCreateNewEnrollmentsCheck}
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
                                                value={program.enrollmentDateColumn}
                                                disabled={!program.createNewEnrollments}
                                                options={program.columns}
                                                onChange={program.handleEnrollmentDateColumnSelectChange}
                                            />
                                            <FormHelperText>Should be a valid date<br/>&nbsp;</FormHelperText>
                                        </Grid>

                                        <Grid item xs={6}>
                                            <Select
                                                placeholder="Incident date column"
                                                isClearable
                                                isSearchable
                                                value={program.incidentDateColumn}
                                                disabled={!program.createNewEnrollments}
                                                options={program.columns}
                                                onChange={program.handleIncidentDateColumnSelectChange}
                                            />
                                            <FormHelperText>Should be a valid date<br/>&nbsp;</FormHelperText>
                                        </Grid>
                                    </Grid>

                                </Grid>
                            </Grid>
                        </li>
                    </ol>
                </Grid>
            </Grid>

        </div>
    }
}

export default withStyles(styles, {withTheme: true})(Step2);
