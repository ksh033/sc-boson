/* eslint-disable @typescript-eslint/no-redeclare */
import ScTable from './ScTable';
import Operation from './Operation';

export { ScTableProps, ColumnsType, ScProColumn, ScProColumnType } from './ScTable';

export { OperationProps } from './Operation';

type ScTable = typeof ScTable;
interface Table extends ScTable {
  Operation: typeof Operation;
}

const Table: Table = ScTable as Table;
Table.Operation = Operation;

export default Table;
