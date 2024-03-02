import http from '../lib/http/index.js'
import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Avatar, Badge, Box, Button, Breadcrumbs, Card, CardContent, Dialog, DialogActions, DialogContent, Divider, Grid, IconButton, DialogContentText,
    DialogTitle, Stack, Tab, Tabs, Typography, Tooltip, Popper, Fade, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText
} from '@mui/material';
import {
    Add, AttachFile, Check, Close, CreditCard, Comment, Delete, Event, History, Notifications as NotificationIcon,
    LocalActivity, Person, Receipt, Refresh, Timeline, Edit, Note, MoreHoriz, Visibility
} from '@mui/icons-material';
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
            "timestamp with time zone": "date",
            "jsonb": "object",
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

        const [selectedRow, setSelectedRow] = useState(null);

        const Topbar = () => {
            const [open, setOpen] = useState(false);
            const handleClickOpen = () => setOpen(true);
            const handleClose = (e, reason) => (reason === "backdropClick") ? null : setOpen(false);

            const AddModal = () => {
                return (<Dialog open={open} onClose={handleClose} maxWidth={'lg'} fullWidth disableBackdropClick>
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
                </Dialog>);
            };

            return <>
                <AddModal />
                <Grid container >
                    <Grid item xs={10}>
                        <Breadcrumbs sx={{ padding: '1rem' }}>
                            <Link underline="hover" color="inherit" onClick={e => setSelectedRow(null)} children={selectedCat.toUpperCase()} />
                            {selectedRow ? <Link underline="hover" color="inherit" children={`ID: ${selectedRow}`} /> : null}
                        </Breadcrumbs>
                    </Grid>
                    {selectedRow ? null : <Grid item xs={2} sx={{ alignSelf: 'center', textAlignLast: 'end', paddingRight: '1rem' }}>
                        <IconButton className="mb-3" variant="outlined" color='success' onClick={handleClickOpen} children={<Add />} />
                        <IconButton className="mb-3" variant="outlined" color='info' onClick={handleClickOpen} children={<Refresh />} />
                        <IconButton className="mb-3" variant="outlined" color='error' onClick={handleClickOpen} children={<Delete />} />
                    </Grid>}
                </Grid>
            </>
        };

        const Table = () => {
            const getActionColumn = () => {

                const ActionButton = (v) => {

                    const [anchorEl, setAnchorEl] = React.useState(null);
                    const popperRef = useRef(null);
                    const open = Boolean(anchorEl);

                    const handleClick = (event) => {
                        setAnchorEl(anchorEl ? null : event.currentTarget);
                    };

                    const handleClickOutside = (event) => {
                        if (popperRef.current && !popperRef.current.contains(event.target)) {
                            setAnchorEl(null);
                        }
                    };

                    useEffect(() => {
                        // Agrega escuchador de clics al documento
                        document.addEventListener('mousedown', handleClickOutside);
                        return () => {
                            // Limpia el escuchador al desmontar el componente
                            document.removeEventListener('mousedown', handleClickOutside);
                        };
                    }, []);

                    const canBeOpen = open && Boolean(anchorEl);
                    const id = canBeOpen ? getRowId(v) + '-spring-popper' : undefined;

                    return <div>
                        <IconButton color='grey.700' label={'Ver Detalles'} children={<MoreHoriz />} onClick={handleClick} />
                        <Popper id={id} open={open} ref={popperRef} anchorEl={anchorEl} transition>
                            {({ TransitionProps }) => (
                                <Fade {...TransitionProps}>
                                    <Card sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                                        <CardContent>
                                            <Typography sx={{ fontSize: 16 }} color="grey.700" gutterBottom>
                                                Actions
                                            </Typography>
                                            <Divider />
                                            <List>
                                                <ListItem disablePadding>
                                                    <Button variant="text" color='info' onClick={e => setSelectedRow(v.id)} endIcon={<Visibility />} children={'Details'} />
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <Button variant="text" color='info' onClick={e => setSelectedRow(v.id)} endIcon={<Edit />} children={'Edition'} />
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <Button variant="text" color='info' onClick={e => setSelectedRow(v.id)} endIcon={<AttachFile />} children={'Attachments'} />
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <Button variant="text" color='info' onClick={e => setSelectedRow(v.id)} endIcon={<Comment />} children={'Comments'} />
                                                </ListItem>
                                                <ListItem disablePadding>
                                                    <Button variant="text" color='info' onClick={e => setSelectedRow(v.id)} endIcon={<History />} children={'History'} />
                                                </ListItem>
                                            </List>
                                        </CardContent>
                                    </Card>
                                </Fade>
                            )}
                        </Popper>
                    </div >
                }

                return {
                    field: 'actions',
                    headerName: 'Actions',
                    width: 100,
                    type: 'actions',
                    renderCell: ActionButton
                }
            };

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

            return <Box sx={{ padding: '1rem', paddingTop: '0' }}>
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
        };

        const RowActions = () => {

            const [value, setValue] = useState(0);
            const handleChange = (event, newValue) => setValue(newValue);

            return <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} >
                        <Tab label="Details" />
                        <Tab label="Edition" />
                        <Tab label="Attachments" />
                        <Tab label="Comments" />
                        <Tab label="History" />
                    </Tabs>
                </Box>
            </Box>
        };

        return (
            <Box sx={{ position: 'relative', height: '100%', width: '100%', backgroundColor: 'white' }}>
                <Topbar />
                {selectedRow ? <RowActions /> : <Table />}
            </Box>
        );
    };

    return <DataGridDemo />
}

// export default withAuthenticationRequired(Dashboard, { onRedirecting: () => <h1>Redirecting</h1> });
export default GenericCat;