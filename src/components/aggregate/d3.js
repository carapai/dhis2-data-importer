import {inject, observer} from 'mobx-react';
import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import pixelWidth from 'string-pixel-width';
import TableBody from '@material-ui/core/TableBody';
import Select from 'react-select';


const styles = theme => ({
    block: {
        // display: 'block',
        // overflow: 'auto'
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

        if (!this.integrationStore.dataSet.fixedExcel) {
            return <TableCell>
                <div style={{width: 200}}>
                    <Select
                        placeholder="Select mapping"
                        value={de.mapping}
                        options={this.integrationStore.dataSet.uniqueDataElements}
                        onChange={de.handelMappingChange(this.integrationStore.dataSet.data, this.integrationStore.dataSet.categoryOptionComboColumn)}
                    />
                </div>
            </TableCell>
        }

        return null;

    };

    displayCell = (de, coc) => {
        if (!this.integrationStore.dataSet.fixedExcel) {
            return <div style={{width: 200}}>
                <Select
                    placeholder="Select cell"
                    value={coc.mapping[de.id]}
                    options={de.uniqueCategoryOptionCombos}
                    onChange={coc.setMappingAll(de)}
                />
            </div>
        } else {
            return <div style={{width: 200}}>
                <Select
                    placeholder="Select cell"
                    value={coc.cell[de.id]}
                    options={this.integrationStore.dataSet.cells}
                    onChange={coc.setCellAll(de)}
                />
            </div>
        }

    };

    render() {
        const {dataSet} = this.integrationStore;
        const {classes} = this.props;
        let displayMappingHeader = null;
        if (!dataSet.fixedExcel) {
            displayMappingHeader = <TableCell>
                Mapping
            </TableCell>;
        }

        return (<div>
                {dataSet.forms.map((form, k) => {
                    return (
                        <div className={classes.block} key={k}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            Data Element
                                        </TableCell>

                                        {displayMappingHeader}

                                        {form.categoryOptionCombos.map(coc => {
                                            return <TableCell key={coc.id}>
                                                <div
                                                    style={{width: pixelWidth(coc.name, {size: 13.5})}}>{coc.name}</div>
                                            </TableCell>
                                        })}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {form.dataElements.map(de => {
                                        return <TableRow key={de.id}>
                                            <TableCell>
                                                <div style={{width: pixelWidth(de.name, {size: 13.5})}}>
                                                    {de.name}
                                                </div>
                                            </TableCell>

                                            {this.displayMapping(de)}

                                            {form.categoryOptionCombos.map(coc => {
                                                return <TableCell key={de.id + coc.id}>
                                                    {this.displayCell(de, coc)}
                                                </TableCell>
                                            })}
                                        </TableRow>
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default withStyles(styles)(D3);
