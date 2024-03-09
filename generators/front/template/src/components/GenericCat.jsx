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

import { getData, postRow } from "./GenericCatSlice.js";
import validator from '@rjsf/validator-ajv8';
import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true, useDefaults: true });
import Form from '@rjsf/mui';

import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';

const GenericCat = ({ selectedCat, auth }) => {

    const { rows, pks, fks } = useSelector(state => state.genericCat.data);
    const schema = useSelector(state => state.dashboard.data?.schema?.properties.tables?.properties);

    const getRowId = r => pks.reduce((p, k) => p + '-' + r[k], '').slice(1);
    const toJSONFormParams = (basicSchema) => {
        const properties = Object.entries(basicSchema?.properties || {}).reduce((p, [k, v]) => {
            if (!((v.type === 'array' || v.type === 'object') && schema?.[k] != null)) // TODO: No se incluyen las FKs
                p[k] = v;
            return p;
        }, {});
        const formSchema = { ...basicSchema, properties };
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
        return { schema: formSchema, uiSchema };
    };

    const dispatch = useDispatch();
    const refreshData = () => { dispatch(getData({ schema, catName: selectedCat })) };

    useEffect(refreshData, [selectedCat]);

    const DataGridDemo = () => {
        const [selectedRow, setSelectedRow] = useState();
        const [checkboxSelection, setCheckboxSelection] = useState([]);

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
                                {...toJSONFormParams(schema?.[selectedCat]?.items)}
                                onSubmit={(v) => console.log(v) || dispatch(postRow({ table: selectedCat, row: v.formData }))}
                                onError={e => console.log('errors', e, toJSONFormParams(schema?.[selectedCat]?.items))}
                                validator={validator}
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
                        <IconButton className="mb-3" variant="outlined" color='info' onClick={refreshData} children={<Refresh />} />
                        <IconButton className="mb-3" variant="outlined" color='error' disabled={true} onClick={handleClickOpen} children={<Delete />} />
                    </Grid>}
                </Grid>
            </>
        };

        const Table = () => {

            const ScrollableTooltip = ({ title, children }) => {
                // Contenido desplazable dentro del Tooltip
                const CustomTooltipContent = () => (
                    <div style={{
                        maxHeight: '50vh', // Ajusta la altura máxima según necesites
                        overflowY: 'auto', // Habilita el desplazamiento vertical
                        //marginRight: '-16px', // Compensa el ancho de la barra de desplazamiento
                        //paddingRight: '16px', // Mantiene el espacio para el contenido, ajusta según el ancho real de la barra de desplazamiento
                        scrollbarWidth: 'none', // Especifico para Firefox
                        '::WebkitScrollbar': {
                            display: 'none' // Especifico para WebKit (Chrome, Safari, etc.)
                        },
                        padding: '8px'
                    }} >
                        {title}
                    </div >
                );
                const LightTooltip = styled(({ className, ...props }) => (
                    <Tooltip {...props} classes={{ popper: className }} />
                ))(({ theme }) => ({
                    [`& .${tooltipClasses.tooltip}`]: {
                        backgroundColor: theme.palette.common.white,
                        color: 'rgba(0, 0, 0, 0.87)',
                        boxShadow: theme.shadows[1],
                        fontSize: 11,
                        minWidth: '5vw', // Ajusta el ancho máximo según necesites
                        maxWidth: '50vw', // Ajusta el ancho máximo según necesites
                    },
                }));
                return (
                    <LightTooltip title={<CustomTooltipContent />} arrow>
                        {children}
                    </LightTooltip>
                );
            };

            const getColumns = () => {
                const tableSchema = schema[selectedCat]?.items?.properties;

                const actionColumn = {
                    field: 'actions',
                    headerName: 'Actions',
                    width: 100,
                    type: 'actions',
                    renderCell: (v) => {

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
                            <IconButton color={'primary'} label={'Ver Detalles'} children={<MoreHoriz />} onClick={handleClick} />
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
                };

                const columns = [...Object.entries(tableSchema || {}).map(([k, x]) => {

                    const getFlexSize = (x) => {
                        if (x.datatype === 'array') return 60;
                        if (x.datatype === 'boolean') return 40;
                        if (x.datatype === 'character varying') return 160;
                        if (x.datatype === 'integer') return 80;
                        if (x.datatype === 'timestamp with time zone') return 160;
                        return 150;
                    };

                    const ToolTipItem = (props) => {

                        const GetItem = (props) => {

                            const GetValue = (props) => {
                                const { k, v } = props;
                                switch (typeof v) {
                                    case 'string': return <div style={{ display: 'flex', alignItems: 'center' }} gap={0}>
                                        <Typography sx={{ color: 'var(--grey-800)' }} children={`${k}:`} />
                                        <Typography
                                            sx={{
                                                color: 'var(--primary-main)', paddingLeft: '0.5rem', whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                marginRight: '16px'
                                            }} children={`"${v}"`} />
                                    </div>;
                                    case 'number': return <div style={{ display: 'flex', alignItems: 'center' }} gap={0}>
                                        <Typography sx={{ color: 'var(--grey-800)' }} children={`${k}:`} />
                                        <Typography
                                            sx={{
                                                color: 'var(--info-main)', paddingLeft: '0.5rem', whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                marginRight: '16px'
                                            }} children={v} />
                                    </div>;
                                    case 'boolean': return <div style={{ display: 'flex', alignItems: 'center' }} gap={0}>
                                        <Typography sx={{ color: 'var(--grey-800)' }} children={`${k}:`} />
                                        <Typography
                                            sx={{
                                                color: 'var(--secondary-main)', paddingLeft: '0.5rem', whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                marginRight: '16px'
                                            }} children={v} />
                                    </div>;
                                    case 'object': return <div style={{ display: 'flex', alignItems: 'center' }} gap={0}>
                                        <Typography sx={{ color: 'var(--grey-800)' }} children={`${k}:`} />
                                        <Typography
                                            sx={{
                                                color: 'white', paddingLeft: '0.5rem', whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                marginRight: '16px'
                                            }} children={v} />
                                    </div>;
                                    default: break;
                                }
                                typeof props === 'object' ? JSON.stringify(props) : props;
                                typeof v === 'object' ? JSON.stringify(v) : v;
                            }

                            return GetValue(props);
                            return `${k} : ${GetValue({ v })}`;
                        };

                        if (typeof props === 'object') {
                            return Object.entries(props).map(([k, v]) => <GetItem k={k} v={v} />)
                        } else {
                            return props;
                        }
                    }

                    return {
                        field: k,
                        headerName: x.title || k,
                        flex: getFlexSize(x),
                        editable: true,
                        renderCell: (params) => {
                            if (x.type === 'timestamp with time zone') return new Date(params.value).toLocaleString();
                            if (x.type === 'boolean') return params.value ? <Check color='success' /> : <Close color='error' />;
                            if (x.type === 'array') return <ScrollableTooltip
                                title={<List
                                    children={params.value?.map(x => <ListItem disablePadding key={x.id}
                                        children={<ListItemButton
                                            children={<ListItemText primary={<ToolTipItem {...x} />} />}
                                        />}
                                    />)}
                                />}
                                children={<Button children={params.value?.length} />}
                            />;
                            if (x.type === 'object') return <ScrollableTooltip title={JSON.stringify(params.value)} children={<Button children={'{ ... }'} />} />;
                            return params.value;
                        }
                    }
                }), actionColumn];

                return columns;
            };

            const columns = getColumns();
            return <Box sx={{ padding: '1rem', paddingTop: '0' }}>
                <DataGrid
                    checkboxSelection
                    //disableRowSelectionOnClick
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
                    onSelectionModelChange={(v) => setCheckboxSelection(v)}
                    selectionModel={checkboxSelection}
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