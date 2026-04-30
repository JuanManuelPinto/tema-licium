import { reactive, h, render, createApp } from 'vue';
import WorkspaceWidget from './WorkspaceWidget.vue';

// Estado global del portafolio
const state = reactive({
    isActive: false,
    records: [],
    collections: []
});

export const workspacePlugin = {
    install(app) {
        // Cargar desde localStorage
        const saved = localStorage.getItem('licium-workspace');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                state.records = parsed.records || [];
                state.collections = parsed.collections || [];
            } catch (e) {
                state.records = [];
                state.collections = [];
            }
        }

        // Métodos globales
        const workspaceAPI = {
            toggle() {
                state.isActive = !state.isActive;
            },
            addItem(item, type = 'record') {
                const list = type === 'collection' ? state.collections : state.records;
                if (!list.find(i => i.id === item.id)) {
                    list.push(item);
                    this.save();
                }
            },
            removeItem(id, type = 'record') {
                if (type === 'collection') {
                    state.collections = state.collections.filter(i => i.id !== id);
                } else {
                    state.records = state.records.filter(i => i.id !== id);
                }
                this.save();
            },
            hasItem(id, type = 'record') {
                const list = type === 'collection' ? state.collections : state.records;
                return list.some(i => i.id === id);
            },
            clear() {
                state.records = [];
                state.collections = [];
                this.save();
            },
            save() {
                localStorage.setItem('licium-workspace', JSON.stringify({
                    records: state.records,
                    collections: state.collections
                }));
            },
            getState() {
                return state;
            }
        };

        // Proveer la API para que cualquier componente la use
        app.provide('workspace', workspaceAPI);
        // También inyectar globalmente para Options API si hiciera falta
        app.config.globalProperties.$workspace = workspaceAPI;

        // Crear e inyectar el componente flotante dinámicamente
        const mountNode = document.createElement('div');
        mountNode.id = 'licium-workspace-root';
        document.body.appendChild(mountNode);

        // Usamos la misma instancia app para que herede el contexto, o creamos un VNode
        const vnode = h(WorkspaceWidget, {
            workspaceState: state,
            api: workspaceAPI
        });
        
        // Renderizamos el widget fuera de la jerarquía principal para que siempre esté por encima
        vnode.appContext = app._context;
        render(vnode, mountNode);
    }
};
