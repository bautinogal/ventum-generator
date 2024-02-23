import http from '../lib/http/index.js'
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Avatar, Badge, Button, Dialog, DialogActions, DialogContent, IconButton, DialogContentText,
    DialogTitle, Stack, Typography
} from '@mui/material';
import {
    Add, AttachFile, Check, Close, CreditCard, Comment, Delete, Event, History, Notifications as NotificationIcon,
    LocalActivity, Person, Receipt, Refresh, Timeline, Edit, Note
} from '@mui/icons-material';

//import DashboardCat from './DashboardCat/DashboardCat.jsx';
import Box from '@mui/material/Box';
import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';

import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/mui';


const GenericCat = ({ selectedCat, auth }) => {
    const schema = useSelector(state => state.dashboard.data?.schema);
    const getRowId = r => pks.reduce((p, k) => p + '-' + r[k], '').slice(1);
    const toJSONFormParams = (basicSchema) => {
        // let basicSchema = [
        //     {
        //         "name": "id",
        //         "datatype": "integer",
        //         "isnullable": false,
        //         "defaultvalue": "nextval('knex_migrations_id_seq'::regclass)",
        //         "position": 1,
        //         "pk": true,
        //         "fk": false
        //     },
        //     {
        //         "name": "name",
        //         "datatype": "character varying",
        //         "isnullable": true,
        //         "defaultvalue": null,
        //         "position": 2,
        //         "pk": false,
        //         "fk": false
        //     },
        //     {
        //         "name": "batch",
        //         "datatype": "integer",
        //         "isnullable": true,
        //         "defaultvalue": null,
        //         "position": 3,
        //         "pk": false,
        //         "fk": false
        //     },
        //     {
        //         "name": "migration_time",
        //         "datatype": "timestamp with time zone",
        //         "isnullable": true,
        //         "defaultvalue": null,
        //         "position": 4,
        //         "pk": false,
        //         "fk": false
        //     }
        // ]
        const typeMapper = {
            "character varying": "string",
            "bigint": "integer",
            "timestamp with time zone": "date"
        }
        const formData = {};
        const uiSchema = {
            "firstName": {
                "ui:autofocus": true,
                "ui:emptyValue": "",
                "ui:placeholder": "ui:emptyValue causes this field to always be valid despite being required",
                "ui:autocomplete": "family-name",
                "ui:enableMarkdownInDescription": true,
                //   "ui:description": "Make text **bold** or *italic*. Take a look at other options [here](https://markdown-to-jsx.quantizor.dev/)."
            },
            "lastName": {
                "ui:autocomplete": "given-name",
                "ui:enableMarkdownInDescription": true,
                //  "ui:description": "Make things **bold** or *italic*. Embed snippets of `code`. <small>And this is a small texts.</small> "
            },
            "age": {
                "ui:widget": "updown",
                "ui:title": "Age of person",
                "ui:description": "(earth year)"
            },
            "bio": {
                "ui:widget": "textarea"
            },
            "password": {
                "ui:widget": "password",
                //   "ui:help": "Hint: Make it strong!"
            },
            "telephone": {
                "ui:options": {
                    "inputType": "tel"
                }
            }
        };
        const schema = {
            "title": `Add a new registry to ${selectedCat}?`,
            // "description": "A simple form example.",
            "type": "object",
            "required": basicSchema?.filter(x => !x.isnullable).map(x => x.name),
            "properties": basicSchema?.reduce((p, x) => ({ ...p, [x.name]: { type: typeMapper[x.datatype] || x.datatype, title: x.name, default: null } }), {})
        }
        return { formData, schema, uiSchema };
    };

    const [rows, setRows] = useState([]);
    const [pks, setPks] = useState([]);

    useEffect(() => {
        setPks(schema[selectedCat].filter(x => x.pk).map(x => x.name));
        http.get(`/api/${selectedCat}/rows`).then(r => setRows(r.body));
    }, [selectedCat]);

    const DataGridDemo = () => {

        const [open, setOpen] = useState(false);
        const handleClickOpen = () => setOpen(true);
        const handleClose = (e, reason) => (reason === "backdropClick") ? null : setOpen(false);

        const AddModal = () => {
            return (
                <React.Fragment>
                    <Dialog open={open} onClose={handleClose} maxWidth={'lg'} fullWidth disableBackdropClick>
                        <DialogTitle id="titulo-dialogo">
                            <IconButton
                                onClick={handleClose}
                                sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                                children={<Close />} />
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                <Form
                                    {...toJSONFormParams(schema[selectedCat])}
                                    validator={validator}
                                    onChange={e => console.log('changed', e)}
                                    onSubmit={e => console.log('submitted', e)}
                                    onError={e => console.log('errors', e)}
                                />
                            </DialogContentText>
                        </DialogContent>

                    </Dialog>
                </React.Fragment>
            );
        };

        // const GridAction = (props) => {
        //     const [anchorEl, setAnchorEl] = useState(null);

        //     const handlePopoverOpen = (event) => {
        //         setAnchorEl(event.currentTarget)
        //     };

        //     const handlePopoverClose = () => {
        //         setAnchorEl(null)
        //     };
        //     const { label, key, Icon } = props;
        //     const open = Boolean(anchorEl);
        //     return (
        //         <Fragment key={key + label}>
        //             <Icon aria-owns={open ? label : undefined}
        //                 aria-haspopup="true"
        //                 onMouseEnter={handlePopoverOpen}
        //                 onMouseLeave={handlePopoverClose}> </Icon>
        //             <Popover
        //                 id={label}
        //                 sx={{
        //                     pointerEvents: 'none',
        //                 }}
        //                 open={open}
        //                 anchorEl={anchorEl}
        //                 anchorOrigin={{
        //                     vertical: 'top',
        //                     horizontal: 'right',
        //                 }}
        //                 transformOrigin={{
        //                     vertical: 'bottom',
        //                     horizontal: 'left',
        //                 }}
        //                 onClose={handlePopoverClose}
        //                 disableRestoreFocus
        //             >
        //                 <Typography sx={{ p: 1 }}>{label}</Typography>
        //             </Popover>
        //         </Fragment>
        //     )
        // };

        const getActionColumn = () => ({
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            type: 'actions',
            renderCell: v =>
                <>
                    <GridActionsCellItem
                        key={getRowId(v) + '-verDetallesContratosGridAction'}
                        color={'info'}
                        onClick={e => { console.log(e) }}
                        icon={<IconButton color='info' label={'Ver Detalles'} children={<Edit color='info' />} />}
                    />
                    <GridActionsCellItem
                        key={getRowId(v) + '-verDetallesContratosGridAction'}
                        color={'primary'}
                        onClick={e => { console.log(e) }}
                        icon={<IconButton color='primary' label={'Ver Detalles'} children={<Comment />} />}
                    />
                    <GridActionsCellItem
                        key={getRowId(v) + '-verDetallesContratosGridAction'}
                        color={'primary'}
                        onClick={e => { console.log(e) }}
                        icon={<IconButton color='primary' label={'Ver Detalles'} children={<AttachFile />} />}
                    />
                    <GridActionsCellItem
                        key={getRowId(v) + '-verDetallesContratosGridAction'}
                        color={'secondary'}
                        onClick={e => { console.log(e) }}
                        icon={<IconButton color='secondary' label={'Ver Detalles'} children={<History color='secondary' />} />}
                    />
                </>
        });

        const columns = [...schema[selectedCat].map(x => {
            const getFlexSize = (x) => {
                if (x.datatype === 'boolean') return 40;
                if (x.datatype === 'character varying') return 160;
                if (x.datatype === 'integer') return 80;
                if (x.datatype === 'timestamp with time zone') return 160;
                return 150;
            }
            return {
                field: x.name,
                headerName: x.name,
                flex: getFlexSize(x),
                editable: true,
                renderCell: (params) => {
                    if (x.datatype === 'timestamp with time zone') return new Date(params.value).toLocaleString();
                    if (x.datatype === 'boolean') return params.value ? <Check color='success' /> : <Close color='error' />;
                    return params.value;

                }
            }
        }), getActionColumn()];

        return (

            <Box sx={{ position: 'relative', height: '100%', width: '100%', backgroundColor: 'white' }}>
                <AddModal />
                <Typography variant="h6" component="div" sx={{ padding: '1rem' }} children={selectedCat.toUpperCase()} />
                <IconButton className="mb-3" variant="contained" color='success' onClick={handleClickOpen} children={<Add />} />
                <IconButton className="mb-3" variant="contained" color='info' onClick={handleClickOpen} children={<Refresh />} />
                <IconButton className="mb-3" variant="contained" color='error' onClick={handleClickOpen} children={<Delete />} />
                <DataGrid
                    checkboxSelection
                    disableRowSelectionOnClick
                    autoHeight
                    getRowId={getRowId}
                    rows={rows}
                    columns={columns}
                    initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                    pageSizeOptions={[10, 20, 50]}
                    pagination
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }}
                />
            </Box>
        );
    };

    return (<div className="container">
        <DataGridDemo />
    </div>)
}

// export default withAuthenticationRequired(Dashboard, { onRedirecting: () => <h1>Redirecting</h1> });
export default GenericCat;