import {inject, observer} from "mobx-react";
import React from "react";
import {withStyles} from "@material-ui/core/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import {InputField} from "@dhis2/d2-ui-core";
import Icon from "@material-ui/core/Icon";
import Dropzone from "react-dropzone";
import Checkbox from "@material-ui/core/Checkbox";
import FormGroup from "@material-ui/core/FormGroup";
import Select from "react-select";
import Params from "./Params";


const styles = theme => ({
    root: {
        display: 'flex',
    },
    formControl: {
        margin: theme.spacing.unit * 3,
    },
    group: {
        margin: `${theme.spacing.unit}px 0`,
    }
});

const items = [
    {label: 'Excel/CSV Listing to DHIS2 Data Set', value: "1"},
    {label: 'Excel Tabular Data to DHIS2 Data Set', value: "2"},
    {label: 'Excel Form to DHIS2 Data Set', value: "3"},
    {label: 'DHIS2 Data Set to DHIS2 Data Set', value: "4"},
    {label: 'DHIS2 Indicators 2 DHIS2 Data Set', value: "5"},
    {label: 'Rest API to DHIS2 Data Set', value: "6"},
];


@inject('IntegrationStore')
@observer
class ImportType extends React.Component {

    integrationStore = null;

    state = {
        value: null,
    };

    handleChange = event => {
        this.setState({value: event.target.value});
    };

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    apiDataSource = () => {
        return <div>
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <InputField
                        label="URL"
                        type="text"
                        fullWidth
                        value={this.integrationStore.dataSet.url}
                        onChange={(value) => this.integrationStore.dataSet.handelURLChange(value)}/>
                </Grid>
            </Grid>

            <Grid container spacing={8}>
                <Grid item xs={6}>
                    <InputField
                        label="Username"
                        type="text"
                        fullWidth
                        value={this.integrationStore.dataSet.username}
                        onChange={(value) => this.integrationStore.dataSet.setUsername(value)}/>
                </Grid>
                <Grid item xs={6}>
                    <InputField
                        label="Password"
                        type="text"
                        fullWidth
                        value={this.integrationStore.dataSet.password}
                        onChange={(value) => this.integrationStore.dataSet.setPassword(value)}/>
                </Grid>
            </Grid>

            {this.integrationStore.dataSet.templateType.value === '6' ? <Params/> : null}
        </div>
    };

    upload = () => {
        return <Dropzone activeStyle={{}}
                         accept=".csv, .xls, .xlsx"
                         onDrop={this.integrationStore.dataSet.onDrop}>
            <p align="center">Drop files here</p>
            <p align="center">
                <Icon color="primary"
                      style={{fontSize: 48}}>
                    add_circle
                </Icon>
            </p>
            <p align="center">{this.integrationStore.dataSet.fileName}</p>
            <p align="center"
               style={{color: 'red'}}>{this.integrationStore.dataSet.uploadMessage}</p>
        </Dropzone>
    };

    render() {
        return <div>
            <Grid container>
                <Grid item xs={12}>
                    <InputField
                        label="Mapping Name"
                        type="text"
                        fullWidth
                        value={this.integrationStore.dataSet.mappingName}
                        onChange={(value) => this.integrationStore.dataSet.handleMappingNameChange(value)}
                    />
                    <InputField
                        label="Mapping Description"
                        type="text"
                        multiline
                        fullWidth
                        value={this.integrationStore.dataSet.mappingDescription}
                        onChange={(value) => this.integrationStore.dataSet.handleMappingDescriptionChange(value)}
                    />
                    <br/>
                    <br/>
                    <Select
                        placeholder="Aggregation Level"
                        value={this.integrationStore.dataSet.templateType}
                        options={items}
                        onChange={this.integrationStore.handleRadioChange}
                        isClearable
                        isSearchable
                    />
                    {/*<FormControl component="fieldset" className={classes.formControl}>
                        <FormLabel component="legend">Import Type</FormLabel>
                        <RadioGroup
                            aria-label="Import Type"
                            name="ImportType"
                            row={true}
                            className={classes.group}
                            value={this.integrationStore.dataSet.templateType}
                            onChange={this.integrationStore.handleRadioChange}
                        >
                            <FormControlLabel value="1" control={<Radio/>} label="Excel/CSV Listing 2 DHIS2 Data Set"/>
                            <FormControlLabel value="2" control={<Radio/>} label="Excel Tabular Data 2 DHIS2 Data Set"/>
                            <FormControlLabel value="3" control={<Radio/>} label="Excel Form 2 DHIS2 Data Set"/>
                            <FormControlLabel value="4" control={<Radio/>} label="DHIS2 Data Set 2 DHIS2 Data Set"/>
                            <FormControlLabel value="5" control={<Radio/>} label="DHIS2 Indicators 2 DHIS2 Data Set"/>
                            <FormControlLabel value="6" control={<Radio/>} label="Rest API 2 DHIS2 Data Set"/>

                        </RadioGroup>
                    </FormControl>*/}
                </Grid>
            </Grid>

            <Grid container>
                <Grid item xs={12}>
                    {this.integrationStore.dataSet.templateType && this.integrationStore.dataSet.templateType.value === '5' ?
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={this.integrationStore.dataSet.dataIndicators}
                                        onChange={this.integrationStore.dataSet.handleDataIndicators}
                                    />
                                }
                                label="Aggregate Indicators"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={this.integrationStore.dataSet.proIndicators}
                                        onChange={this.integrationStore.dataSet.handleProIndicators}
                                    />
                                }
                                label="Program Indicators"
                            />
                        </FormGroup> : null}
                    {this.integrationStore.dataSet.templateType ? this.integrationStore.dataSet.getImportDataSource === 1 ? this.upload() : this.apiDataSource() : null}
                </Grid>
            </Grid>
        </div>


    }

}

export default withStyles(styles)(ImportType);

