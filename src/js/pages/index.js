const HomeIndex = () => import('./HomeIndex.vue');

const routes = [
	{path: '/', component: HomeIndex},
];

const router = new VueRouter({
	routes,
});

export default router;
