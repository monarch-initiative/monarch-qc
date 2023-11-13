import { createApp } from "vue"
import "./style.css"
import App from "./App.vue"
import { updateData } from "./data"
import VueApexCharts from "vue3-apexcharts"

updateData()

const app = createApp(App)

// Register VueApexCharts as a global component
app.use(VueApexCharts)

app.mount("#app")
