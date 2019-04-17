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


const styles = theme => ({
    block: {
        display: 'block',
        overflow: 'auto'
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
        // this.integrationStore.dataSet.setDefaults();
    }

    displayMapping = (de) => {

        if (this.integrationStore.dataSet.templateType === '1') {
            return <TableCell width="300">
                <Select
                    placeholder="Select mapping"
                    isClearable
                    isSearchable
                    value={de.mapping}
                    options={this.integrationStore.dataSet.uniqueDataElements}
                    onChange={de.handelMappingChange(this.integrationStore.dataSet.data, this.integrationStore.dataSet.categoryOptionComboColumn, this.integrationStore.dataSet.isDhis2)}
                />
            </TableCell>
        }

        return null;

    };

    componentDidMount() {
        if (this.integrationStore.dataSet.templateType === '4') {
            this.integrationStore.dataSet.loadSame();
        } else if (this.integrationStore.dataSet.templateType === '1') {
            this.integrationStore.dataSet.setDefaults();
        }
    }

    displayCell = (de, coc) => {
        if (this.integrationStore.dataSet.templateType === '2') {
            return <Select
                placeholder="Select cell"
                value={coc.cell[de.id]}
                isClearable
                isSearchable
                options={this.integrationStore.dataSet.cells}
                onChange={coc.setCellAll(de)}
            />

        } else if (this.integrationStore.dataSet.templateType === '3') {
            return <Select
                placeholder="Select cell"
                isClearable
                isSearchable
                value={coc.column[de.id]}
                options={this.integrationStore.dataSet.cellColumns}
                onChange={coc.setColumnAll(de)}
            />
        } else if (this.integrationStore.dataSet.templateType === '1') {
            return <Select
                isClearable
                isSearchable
                placeholder="Select cell"
                value={coc.mapping[de.id]}
                options={de.uniqueCategoryOptionCombos}
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
        // const {classes} = this.props;
        let displayMappingHeader = null;
        let display = null;
        if (this.integrationStore.dataSet.templateType === '1') {
            displayMappingHeader = <TableCell width="400">
                Mapping
            </TableCell>;
        }

        if (this.integrationStore.dataSet.templateType !== '4') {
            display = dataSet.forms.map((form, k) => {
                return (
                    <div key={k} className="scrollable">
                        <Table width={form.categoryOptionCombos.length * 300 + 600}
                               style={{minWidth: '100%'}}>
                            <TableHead>
                            <TableRow>
                                <TableCell>
                                    Data Element
                                </TableCell>

                                {displayMappingHeader}

                                {form.categoryOptionCombos.map(coc => {
                                    return <TableCell key={coc.id} width="300">
                                        {coc.name}
                                    </TableCell>
                                })}
                                <TableCell width="50">Status</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {form.dataElements.map(de => {
                                return <TableRow key={de.id}>
                                    <TableCell style={{minWidth: 400}}>
                                        {de.name}
                                    </TableCell>

                                    {this.displayMapping(de)}

                                    {form.categoryOptionCombos.map(coc => {
                                        return <TableCell key={de.id + coc.id}>
                                            {this.displayCell(de, coc)}
                                        </TableCell>
                                    })}
                                    <TableCell>
                                        {form.status[de.id].all ? <DoneAll/> : form.status[de.id].some ? <Done/> :
                                            <Clear/>}
                                    </TableCell>
                                </TableRow>
                            })}
                            </TableBody>
                        </Table>
                    </div>
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
