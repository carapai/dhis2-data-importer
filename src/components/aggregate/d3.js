import {inject, observer} from 'mobx-react';
import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Select from 'react-select';

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import {Done, Clear, DoneAll} from '@material-ui/icons'
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from "@material-ui/core/Typography";


const styles = theme => ({
    block: {
        // display: 'block',
        overflow: 'auto',
        maxHeight: 500
    }
});


@inject('IntegrationStore')
@observer
class D3 extends React.Component {
    integrationStore = null;

    constructor(props) {
        super(props);
        const {IntegrationStore} = props;
        this.integrationStore = IntegrationStore;
    }

    displayMapping = (de) => {

        if (this.integrationStore.dataSet.templateType.value === '1' || this.integrationStore.dataSet.templateType.value === '6') {
            return <td width="300">
                <Select
                    placeholder="Select mapping"
                    isClearable
                    isSearchable
                    value={de.mapping}
                    options={this.integrationStore.dataSet.uniqueDataElements}
                    onChange={de.handelMappingChange(this.integrationStore.dataSet.data, this.integrationStore.dataSet.categoryOptionComboColumn, this.integrationStore.dataSet.isDhis2)}
                />
            </td>
        }

        return null;

    };

    componentDidMount() {
        if (this.integrationStore.dataSet.templateType.value === '2') {
            this.integrationStore.dataSet.loadSame();
        } else if (this.integrationStore.dataSet.templateType.value === '1' || this.integrationStore.dataSet.templateType.value === '4' || this.integrationStore.dataSet.templateType.value === '6') {
            this.integrationStore.dataSet.setDefaults();
        } else if (this.integrationStore.dataSet.templateType.value === '5') {
            this.integrationStore.dataSet.pullIndicatorData();
            this.integrationStore.dataSet.setDefaultIndicators();
        }
    }

    displayCell = (de, coc) => {
        if (this.integrationStore.dataSet.templateType.value === '3') {
            return <Select
                placeholder="Select cell"
                value={coc.cell[de.id]}
                isClearable
                isSearchable
                options={this.integrationStore.dataSet.cells}
                onChange={coc.setCellAll(de)}
            />

        } else if (this.integrationStore.dataSet.templateType.value === '2') {
            return <Select
                placeholder="Select cell"
                isClearable
                isSearchable
                value={coc.column[de.id]}
                options={this.integrationStore.dataSet.cellColumns}
                onChange={coc.setColumnAll(de)}
            />
        } else if (this.integrationStore.dataSet.templateType.value === '1' || this.integrationStore.dataSet.templateType.value === '4' || this.integrationStore.dataSet.templateType.value === '6') {
            return <Select
                isClearable
                isSearchable
                placeholder="Select cell"
                value={coc.mapping[de.id]}
                options={de.uniqueCategoryOptionCombos}
                onChange={coc.setMappingAll(de)}
            />
        } else if (this.integrationStore.dataSet.templateType.value === '5') {
            return <Select
                isClearable
                isSearchable
                placeholder="Select indicator"
                value={coc.mapping[de.id]}
                options={this.integrationStore.dataSet.indicatorOptions}
                onChange={coc.setMappingAll(de)}
            />
        }

    };

    displayDynamicCell = de => {
        return <Select
            placeholder="Select cell"
            isClearable
            isSearchable
            value={this.integrationStore.dataSet.cell2[de.name]}
            options={this.integrationStore.dataSet.allCategoryOptionCombos}
            onChange={this.integrationStore.dataSet.setMappingAll2(de)}
        />
    };

    render() {
        const {dataSet} = this.integrationStore;
        const {classes} = this.props;
        let displayMappingHeader = null;
        let display = null;
        if (this.integrationStore.dataSet.templateType.value === '1' || this.integrationStore.dataSet.templateType.value === '6') {
            displayMappingHeader = <th width="400">
                Mapping
            </th>;
        }

        if (this.integrationStore.dataSet.templateType.value !== '2') {
            display = dataSet.forms.map((form, k) => {
                return (
                    <ExpansionPanel key={k} expanded={this.integrationStore.expanded === k}
                                    onChange={this.integrationStore.handlePanelChange(k)}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>{form.name}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails className={classes.block}>
                            <table width={form.categoryOptionCombos.length * 300 + 600}
                                   style={{minWidth: '100%'}} cellPadding="5">
                                <thead>
                                <tr>
                                    <th>
                                        Data Element
                                    </th>

                                    {displayMappingHeader}

                                    {form.categoryOptionCombos.map(coc => {
                                        return <th key={coc.id} width="300">
                                            {coc.name}
                                        </th>
                                    })}
                                    <th width="50">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {form.dataElements.map(de => {
                                    return <tr key={de.id}>
                                        <td style={{minWidth: 400}}>
                                            {de.name}
                                        </td>

                                        {this.displayMapping(de)}

                                        {form.categoryOptionCombos.map(coc => {
                                            return <td key={de.id + coc.id}>
                                                {this.displayCell(de, coc)}
                                            </td>
                                        })}
                                        <td>
                                            {form.status[de.id].all ? <DoneAll/> : form.status[de.id].some ?
                                                <Done/> :
                                                <Clear/>}
                                        </td>
                                    </tr>
                                })}
                                </tbody>
                            </table>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                );
            });
        } else {
            display = <div className="scrollable">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Data Element
                            </TableCell>
                            <TableCell>
                                Mapping
                            </TableCell>
                            <TableCell>
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.integrationStore.dataSet.mergedCellsWithDataElementRow.map(de => {
                            return <TableRow key={de.column} hover>
                                <TableCell>
                                    {de.name}
                                </TableCell>
                                <TableCell>
                                    {this.displayDynamicCell(de)}
                                </TableCell>

                                <TableCell>
                                    {!!this.integrationStore.dataSet.cell2[de.name] ? <Done/> : <Clear/>}
                                </TableCell>
                            </TableRow>
                        })}
                    </TableBody>
                </Table>
            </div>
        }

        return (<div>
                {display}
            </div>
        );
    }
}

export default withStyles(styles)(D3);
