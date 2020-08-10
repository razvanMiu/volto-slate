import React from 'react';
import Table from './Table';

export const TableContainer = ({
  rowCount,
  columnCount,
  activeRow,
  activeColumn,
  onCellClick,
  onCellMouseEnter,
  onCellMouseLeave,
}) => {
  const [activeRowState, setActiveRowState] = React.useState(activeRow);
  const [activeColumnState, setActiveColumnState] = React.useState(
    activeColumn,
  );

  return (
    <div style={{ padding: '1rem' }}>
      <Table
        rowCount={rowCount}
        columnCount={columnCount}
        onCellClick={onCellClick}
        onCellMouseEnter={({ row, column }) => {
          onCellMouseEnter({ row, column });
          setActiveRowState(row);
          setActiveColumnState(column);
        }}
        onCellMouseLeave={onCellMouseLeave}
      />
      <p
        style={{
          textAlign: 'center',
        }}
      >
        {activeColumnState || 1} &times; {activeRowState || 1}
      </p>
    </div>
  );
};

export default TableContainer;
