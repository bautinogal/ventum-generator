import http from '../../../../lib/http/index.js'
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Accordion, AccordionSummary, AccordionDetails, Avatar, Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Stack, TextField, Typography, Tabs, Tab
} from '@mui/material';
import {
    Add, AttachFile, Check, Close, CreditCard, Comment, Delete, Drafts, Event, ExpandMore, History, Notifications as NotificationIcon,
    LocalActivity, Person, Receipt, Refresh, Timeline, Edit, Note, Inbox
} from '@mui/icons-material';

//import DashboardCat from './DashboardCat/DashboardCat.jsx';
import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';

import validator from '@rjsf/validator-ajv8';
import Form from '@rjsf/mui';


// Reference: https://assets-global.website-files.com/58fe8f93dc9e750ca84ebb16/5d54484e2c90f6537022dbb2_Screen%20Shot%202019-08-14%20at%2010.42.48%20AM.png
//https://dtdocs.sisense.com/article/managing-user-permissions-rbac

const Rols = ({ }) => {
    return (<>
    <div style={{ height: '8vh', width: '100%', backgroundColor: 'white' }}>
            <Typography variant="h4" padding='1rem' gutterBottom component="div" children={'Roles'} />
        </div>
        <Grid container spacing={0} height='100%'>
            <Grid item xs={2} sx={{ backgroundColor: 'white', width: '100%' }}>
                <Box sx={{ width: '100%', padding: '10px', bgcolor: 'background.paper' }}>
                    <TextField id="standard-basic" label="Buscar" variant="standard" />
                    <Button variant="contained">Nuevo</Button>
                    <Divider />
                    <nav aria-label="secondary mailbox folders">
                        <List>
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemText primary="Admin" />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton component="a" href="#simple-list">
                                    <ListItemText primary="Cliente" />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </nav>
                </Box>
            </Grid>
            <Grid item xs={10} sx={{ backgroundColor: 'grey', height: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs >
                        <Tab label="Permisos" />
                        <Tab label="Usuarios" />
                        <Tab label="Historial" />
                    </Tabs>
                </Box>
                <Box sx={{ padding: 1, borderColor: 'divider' }}>
                    {/* <Typography variant="h6" gutterBottom component="div" children={'Permisos Genéricos Tablas'} /> */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />} children={'Permisos Genéricos Tablas'} />
                        <AccordionDetails>
                            <DataGrid
                                checkboxSelection
                                disableRowSelectionOnClick
                                autoHeight
                                // getRowId={getRowId}
                                rows={[]}
                                columns={[]}
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
                        </AccordionDetails>
                    </Accordion>
                </Box>
                <Box sx={{ padding: 1, borderColor: 'divider' }}>
                    {/* <Typography variant="h6" gutterBottom component="div" children={'Otros Permisos'} /> */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />} children={'Otros Permisos'} />
                        <AccordionDetails>
                            <DataGrid
                                checkboxSelection
                                disableRowSelectionOnClick
                                autoHeight
                                // getRowId={getRowId}
                                rows={[]}
                                columns={[]}
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
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Grid>
        </Grid>
        {/* <div className="modal-backdrop" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div className="modal" style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '5px',
                zIndex: 1000,
            }}>
                <p>Contenido del Modal</p>
                <button onClick={() => console.log(false)}>Cerrar</button>
            </div >
        </div > */}
        
    </>)
}

// export default withAuthenticationRequired(Dashboard, { onRedirecting: () => <h1>Redirecting</h1> });
export default Rols;