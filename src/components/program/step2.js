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


const styles = theme => ({
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
            <table width="100%">
                <tbody>
                <tr>
                    <td valign="top">
                        <ol>
                            <li>
                                <table width="100%">
                                    <tbody>
                                    <tr>
                                        <td>Upload file to import OR &nbsp;&nbsp;&nbsp;Enter URL and pull</td>
                                    </tr>
                                    <tr>
                                        <td valign="top">
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
                                                        <p align="center"
                                                           style={{color: 'red'}}>{program.uploadMessage}</p>
                                                    </Dropzone>
                                                </div>
                                            </section>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td valign="top" align="right">
                                            <InputField
                                                label="URL"
                                                type="text"
                                                fullWidth
                                                value={program.url}
                                                onChange={(value) => program.handelURLChange(value)}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <InputField
                                                label="Response key"
                                                type="text"
                                                fullWidth
                                                value={program.responseKey}
                                                onChange={(value) => program.setResponseKey(value)}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <InputField
                                                label="Username"
                                                type="text"
                                                fullWidth
                                                value={program.username}
                                                onChange={(value) => program.setUsername(value)}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <InputField
                                                label="Password"
                                                type="text"
                                                fullWidth
                                                value={program.password}
                                                onChange={(value) => program.setPassword(value)}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Params/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                disabled={!program.url}
                                                onClick={program.pullData}>
                                                Pull
                                            </Button>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </li>
                        </ol>

                    </td>
                    <td valign="top" colSpan="2">
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
                                                value={program.selectedSheet}
                                                options={program.sheets}
                                                onChange={program.setSelectedSheet}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <InputField
                                                label="Header row"
                                                type="number"
                                                fullWidth
                                                value={program.headerRow}
                                                onChange={(value) => program.handelHeaderRowChange(value)}
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <InputField
                                                label="Data start row"
                                                type="number"
                                                fullWidth
                                                value={program.dataStartRow}
                                                onChange={(value) => program.handelDataRowStartChange(value)}
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

                        <ol start="3">
                            <li>
                                Organisation unit options
                                <table width="100%">
                                    <tbody>
                                    <tr>
                                        <td>
                                            <Select
                                                placeholder="Organisation unit column"
                                                value={program.orgUnitColumn}
                                                options={program.columns}
                                                onChange={program.handleOrgUnitSelectChange}
                                            />
                                            <FormHelperText>For new tracked entities and events, this column will be
                                                used as organisation unit</FormHelperText>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Select
                                                placeholder="Identifier scheme"
                                                value={program.orgUnitStrategy}
                                                options={items}
                                                onChange={program.handleOrgUnitStrategySelectChange}
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
                </tr>
                <tr>
                    <td valign="top" colSpan="3">
                        <ol start="4">
                            <li>
                                Advanced Options
                            </li>
                        </ol>
                    </td>
                </tr>

                <tr>
                    <td valign="top" className={classes.space}>
                        Events
                    </td>
                    <td valign="top" colSpan="2">
                        Enrollments & Entities
                    </td>
                </tr>

                <tr>
                    <td valign="top">
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={program.updateEvents}
                                        onChange={program.handleUpdateEventsCheck}
                                    />}
                                label="Update events"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={program.createNewEvents}
                                        onChange={program.handleCreateNewEventsCheck}
                                    />}
                                label="Create new events"
                            />
                        </FormGroup>
                    </td>
                    <td valign="top" colSpan="2">
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        disabled={!program.isTracker}
                                        checked={program.createEntities}
                                        onChange={program.handleCreateEntitiesCheck}
                                    />}
                                label="Create new entities"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        disabled={!program.isTracker}
                                        checked={program.updateEntities}
                                        onChange={program.handleUpdateEntitiesCheck}
                                    />}
                                label="Update entities"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        disabled={!program.isTracker}
                                        checked={program.createNewEnrollments}
                                        onChange={program.handleCreateNewEnrollmentsCheck}
                                    />}
                                label="Create new enrollments"
                            />
                        </FormGroup>
                    </td>
                </tr>
                <tr>
                    <td valign="top" width="50%">
                        <Select
                            placeholder="Event date column"
                            value={program.eventDateColumn}
                            options={program.columns}
                            onChange={program.handleEventDateColumnSelectChange}
                        />
                        <FormHelperText>Program stage events will updated or created based on this column. Non
                            repeatable with latest values while repeatable with updates if same or new otherwise.
                            Should be a valid date</FormHelperText>
                    </td>
                    <td valign="top" width="25%">
                        <Select
                            placeholder="Enrollment date column"
                            value={program.enrollmentDateColumn}
                            disabled={!program.createNewEnrollments}
                            options={program.columns}
                            onChange={program.handleEnrollmentDateColumnSelectChange}
                        />
                        <FormHelperText>Should be a valid date<br/>&nbsp;</FormHelperText>
                    </td>
                    <td width="25%">
                        <Select
                            placeholder="Incident date column"
                            value={program.incidentDateColumn}
                            disabled={!program.createNewEnrollments}
                            options={program.columns}
                            onChange={program.handleIncidentDateColumnSelectChange}
                        />
                        <FormHelperText>Should be a valid date<br/>&nbsp;</FormHelperText>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    }
}

export default withStyles(styles)(Step2);
