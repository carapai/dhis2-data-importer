import {inject, observer} from 'mobx-react';
import React from 'react';
import {withStyles} from '@material-ui/core/styles';
// import pixelWidth from 'string-pixel-width';
import Select from 'react-select';

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";


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
            return <td>
                <Select
                    placeholder="Select mapping"
                    value={de.mapping}
                    options={this.integrationStore.dataSet.uniqueDataElements}
                    onChange={de.handelMappingChange(this.integrationStore.dataSet.data, this.integrationStore.dataSet.categoryOptionComboColumn)}
                />
            </td>
        }

        return null;

    };

    componentDidMount() {
        if (this.integrationStore.dataSet.templateType === '4') {
            this.integrationStore.dataSet.loadSame();
        }
    }

    displayCell = (de, coc) => {
        if (this.integrationStore.dataSet.templateType === '2') {
            return <Select
                placeholder="Select cell"
                value={coc.cell[de.id]}
                options={this.integrationStore.dataSet.cells}
                onChange={coc.setCellAll(de)}
            />

        } else if (this.integrationStore.dataSet.templateType === '3') {
            return <Select
                placeholder="Select cell"
                value={coc.column[de.id]}
                options={this.integrationStore.dataSet.cellColumns}
                onChange={coc.setColumnAll(de)}
            />
        } else if (this.integrationStore.dataSet.templateType === '1') {
            return <Select
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
            displayMappingHeader = <th>
                Mapping
            </th>;
        }

        if (this.integrationStore.dataSet.templateType !== '4') {
            display = dataSet.forms.map((form, k) => {
                return (
                    <div key={k}>
                        <table width="100%">
                            <thead>
                            <tr>
                                <th>
                                    Data Element
                                </th>

                                {displayMappingHeader}

                                {form.categoryOptionCombos.map(coc => {
                                    return <th key={coc.id}>
                                        {/*<div style={{width: pixelWidth(coc.name, {size: 13.5})}}>{coc.name}</div>*/}
                                        {coc.name}
                                    </th>
                                })}
                            </tr>
                            </thead>
                            <tbody>
                            {form.dataElements.map(de => {
                                return <tr key={de.id}>
                                    <td>
                                        {/*<div style={{width: pixelWidth(de.name, {size: 13.5})}}></div>*/}
                                        {de.name}
                                    </td>

                                    {this.displayMapping(de)}

                                    {form.categoryOptionCombos.map(coc => {
                                        return <td key={de.id + coc.id}>
                                            {this.displayCell(de, coc)}
                                        </td>
                                    })}
                                </tr>
                            })}
                            </tbody>
                        </table>
                    </div>
                );
            });
        } else {
            // display = JSON.stringify(this.integrationStore.dataSet.mergedCellsWithDataElementRow, null, 2);
            display = <Table width="100%">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            Data Element
                        </TableCell>
                        <TableCell>
                            Mapping
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
                        </TableRow>
                    })}
                </TableBody>
            </Table>
        }

        return (<div>
                {display}
            </div>
        );
    }
}

export default withStyles(styles)(D3);
