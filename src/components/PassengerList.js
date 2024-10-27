import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { DataGrid, GridToolbarContainer, GridActionsCellItem, GridRowModes } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { useAppContext } from '../contexts/AppContext';



const genderOptions = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'T', label: 'Transgender' },
];

const preferenceOptions = [
  { value: 'No Preference', label: 'No Preference' },
  { value: 'LB', label: 'Lower' },
  { value: 'MB', label: 'Middle' },
  { value: 'UB', label: 'Upper' },
  { value: 'SL', label: 'Side Lower' },
  { value: 'SU', label: 'Side Upper' },
];


function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = Date.now(); // Generate a new ID
    setRows((oldRows) => [
      ...oldRows,
      { id, name: '', age: '', gender: '', preference: '', isNew: true },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };
  
  // Prop types validation
  EditToolbar.propTypes = {
    setRows: PropTypes.func.isRequired,
    setRowModesModel: PropTypes.func.isRequired,
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add Passenger
      </Button>
    </GridToolbarContainer>
  );
}

const PassengerList = () => {
  const { formData,handleChange } = useAppContext();
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [selectionModel, setSelectionModel] = useState([]);

  useEffect(() => {
    setRows(formData.passengerList);
  }, [formData])
  

  const handleRowEditStop = (params, event) => {
    if (params.reason === 'rowFocusOut') {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    const filterRows = rows.filter((row) => row.id !== id);
    setRows(filterRows);
    setSelectionModel(selectionModel.filter((selectedId) => selectedId !== id)); // Remove deleted id from selection
    // Call handleChange with the updated passenger names
    handleChange({ target: { name: 'passengerList', value: filterRows } });
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    // Update the rows state
    const updatedRows = rows.map((row) => (row.id === newRow.id ? updatedRow : row));
    setRows(updatedRows);
    // Call handleChange with the updated passenger names
    handleChange({ target: { name: 'passengerList', value: updatedRows } });
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 180, editable: true },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      width: 80,
      editable: true,
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 120,
      editable: true,
      type: 'singleSelect',
      valueOptions: genderOptions,
    },
    {
      field: 'preference',
      headerName: 'Preference',
      width: 180,
      editable: true,
      type: 'singleSelect',
      valueOptions: preferenceOptions,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <GridActionsCellItem key="save" icon={<SaveIcon />} label="Save" sx={{ color: 'primary.main' }} onClick={handleSaveClick(id)} />,
            <GridActionsCellItem key="cancel" icon={<CancelIcon />} label="Cancel" onClick={handleCancelClick(id)} color="inherit" />,
          ];
        }

        return [
          <GridActionsCellItem key="edit" icon={<EditIcon />} label="Edit" onClick={handleEditClick(id)} color="primary" />,
          <GridActionsCellItem key="delete" icon={<DeleteIcon />} label="Delete" onClick={handleDeleteClick(id)} color="error" />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ display:'flex',flexDirection:'column', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        checkboxSelection // Enable checkbox selection
        selectionModel={selectionModel}
        onSelectionModelChange={(newSelection) => {
          setSelectionModel(newSelection);
        }}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        pagination={false}  // Disable pagination
        disableColumnFilter // Disable filtering
        disableColumnSelector // Disable column management
        disableDensitySelector // Disable density selector
        disableRowSelectionOnClick // Optional: Prevent row selection on click
        hideFooter
      />
       {rows.length === 0 && (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          No passengers added.
        </Box>
      )}
    </Box>
  );
};

export default PassengerList;
