const resource_cancel_image = "Cancel_grey_16xMD.png";
const resource_remove_image = "Cancel_16x.png";
const resource_add_label_image = "AddClause_16x.png";
const resource_options_image = "ConfigurationFile_16x.png";
const resource_data_image = "Datalist_16x.png";
const resource_add_data_image = "Add_thin_10x_16x.png";
const resource_title_tag_image = "TitleTag_16x.png";
const resource_background_color_image = "BackgroundColor_16x.png";
const resource_color_palette_image = "ColorPalette_16x.png";
const resource_border_width_image = "LineChart_16x.png";
const resource_collapse_image = "CollapseChevronUp_16x.png";
const resource_expand_image = "CollapseChevronDown_16x.png";

function app_init()
{
    const App = {
        surface: null,
        ctx: null,
        width: 200,
        height: 200,
        local: null,
    };
    
    App.surface = document.getElementById("surface");
    if ((App.surface == null) || (App.surface == undefined))
    {
        return null;
    }
    App.ctx = App.surface.getContext("2d");
    if ((App.ctx == null) || (App.ctx == undefined))
    {
        return null;
    }
    App.width = App.surface.clientWidth;
    App.height = App.surface.clientHeight;
    App.alert = document.getElementById("alert_section");

    App.lang = JSON.parse(localStorage.getItem("app_lang")) || "en";

    App.recent_name = JSON.parse(localStorage.getItem("app_recent_name")) || language[App.lang].app_new;
    App.chart_type = JSON.parse(localStorage.getItem("chart_type")) || "line";
    App.data = JSON.parse(localStorage.getItem("app_data")) || {
        labels: [],
        datasets: [],
    };
    App.options = JSON.parse(localStorage.getItem("app_options")) || {
        title: { display: false },
        legend: { display: true },
    };
    App.options.plugins = {
        customCanvasBackgroundColor: { color: "white" },
        legend: { display: true, },
        tooltip: { enabled: true },
    };
    App.theme = JSON.parse(localStorage.getItem("app_theme")) || "light";

    if (App.theme === "light")
    {
        App.options.plugins.customCanvasBackgroundColor.color = "white";
        Chart.defaults.color = '#000';
    }
    else
    {
        App.options.plugins.customCanvasBackgroundColor.color = "#49494b";
        Chart.defaults.color = "white";
    }

    return App;
}

function report_error(app, message)
{
    app.alert.style.visibility = "visible";
    app.alert.innerHTML = message;
}

function chart_draw(chart, app)
{
    if (chart != null)
    {
        chart.destroy();
    }

    // @todo: check how useful is this:
/*    localStorage.setItem("chart_type", JSON.stringify(app.chart_type));
    localStorage.setItem("app_data", JSON.stringify(app.data));
    localStorage.setItem("app_options", JSON.stringify(app.options));*/

    const data = {
        labels: app.data.labels,
        datasets: app.data.datasets,
    };
    const type = app.chart_type;

    const plugin = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {
          const {ctx} = chart;
          ctx.fillStyle = options.color || '#99ffff';
          ctx.fillRect(0, 0, chart.width, chart.height);
        }
    };

    const new_chart = new Chart(app.ctx, {
        type: type,
        data: data,
        options: app.options,
        plugins: [plugin],
    });
    return new_chart;
}

function chart_add_label(app)
{
    app.data.labels.push("");
}

function chart_remove_label(app, index)
{
    app.data.labels.splice(index, 1);
}

function chart_reset()
{
    localStorage.clear();
    location.reload();
}

function chart_save_state(state, value)
{
    localStorage.setItem(state, JSON.stringify(value));
}

function app_dataset_remove(app, index)
{
    app.data.datasets.splice(index, 1);
    chart_save_state("app_data", app.data);
    // @todo: change to just remove the element without reloading the whole page
    // because this can become a problem with larger datasets reloading
    location.reload();
}

function app_render_labels_from_storage(app, chart)
{
    const labels_container = document.getElementById("label_inputs");
    const add_label_button = document.getElementById("add_label");

    for (var i = 0; i < app.data.labels.length; ++i)
    {
        const label = document.createElement("div");
        label.setAttribute("class", "input field");

        const input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("placeholder", app.local.label_placeholder);
        input.custom_index = i;
        input.setAttribute("value", app.data.labels[i]);
        input.addEventListener("input", function(e){
            app.data.labels[e.currentTarget.custom_index] = input.value;
            chart.update();
            chart_save_state("app_data", app.data);
        });

        const x = document.createElement("img");
        x.src = "data/icons/" + resource_cancel_image;
        x.alt = app.local.label_remove_alt + i;
        x.title = app.local.label_remove_title;
        x.custom_index = i;
        x.addEventListener("click", function(e){
            const nodes = Array.prototype.slice.call(labels_container.children);
            const index = nodes.indexOf(label);
            chart_remove_label(app, index);
            label.remove();
            chart.update();
            chart_save_state("app_data", app.data);
        });

        label.appendChild(input);
        label.appendChild(x);
        labels_container.insertBefore(label, add_label_button.parentNode);

        chart.update();
    }
}

function app_render_datasets_from_storage(app, chart)
{
    const datasets = document.getElementById("datasets");
    const add_dataset_button = document.getElementById("add_dataset");

    for (var i = 0; i < app.data.datasets.length; ++i)
    {
        const dataset_element = document.createElement("div");
        dataset_element.setAttribute("class", "dataset");
        dataset_element.setAttribute("id", "dataset_"+i);
        {
            const tab_element = document.createElement("div");
            tab_element.setAttribute("class", "tab");
            var button_element = document.createElement("button");
            button_element.setAttribute("class", "tablinks tl"+i);
            button_element.setAttribute("type", "button");
            button_element.setAttribute("id", "default_open"+i);
            button_element.setAttribute("title", app.local.datasets_data_title);
            button_element.innerHTML = `<img src="data/icons/${resource_data_image}" alt="${app.local.datasets_data_title}">`;
            button_element.custom_index = i;
            button_element.addEventListener("click", function(e){
                open_tab(e, "Data"+e.currentTarget.custom_index, e.currentTarget.custom_index);
            });
            tab_element.appendChild(button_element);

            button_element = document.createElement("button");
            button_element.setAttribute("class", "tablinks tl"+i);
            button_element.setAttribute("type", "button");
            button_element.setAttribute("title", app.local.datasets_options_title);
            button_element.innerHTML = `<img src="data/icons/${resource_options_image}" alt="${app.local.datasets_options_title}">`;
            button_element.custom_index = i;
            button_element.addEventListener("click", function(e){
                open_tab(e, "Options"+e.currentTarget.custom_index, e.currentTarget.custom_index);
            });
            tab_element.appendChild(button_element);

            button_element = document.createElement("button");
            button_element.setAttribute("class", "tablinks tl"+i);
            button_element.setAttribute("type", "button");
            button_element.setAttribute("title", app.local.datasets_remove_title);
            button_element.innerHTML = `<img src="data/icons/${resource_remove_image}" alt="${app.local.datasets_remove_title}">`;
            button_element.custom_index = i;
            button_element.addEventListener("click", function(e){
                app_dataset_remove(app, e.currentTarget.custom_index);
                chart.update();
                chart_save_state("app_data", app.data);
            });
            tab_element.appendChild(button_element);

            dataset_element.appendChild(tab_element);

            const data_element = document.createElement("div");
            data_element.setAttribute("id", "Data"+i);
            data_element.setAttribute("class", "tabcontent tc" + i + " data_container");
            data_element.innerHTML = `
                <div class="field" style="flex: 100%;">
                    <button type="button" id="add_data_${i}" title="${app.local.datasets_add_data_title}" style="display: flex; align-items: center;">
                        <img src="data/icons/${resource_add_data_image}" alt="${app.local.datasets_add_data_title}"> ${app.local.datasets_data_title}
                    </button>
                </div>
            `;
            dataset_element.appendChild(data_element);

            const options_element = document.createElement("div");
            options_element.setAttribute("id", "Options"+i);
            options_element.setAttribute("class", "tabcontent tc"+i);
            options_element.setAttribute("style", "flex-direction: column;");
            options_element.innerHTML = `
            <div class="input field">
                <label class="options_label" for="category_${i}">
                    <img src="data/icons/${resource_title_tag_image}" 
                         alt="${app.local.datasets_options_category}"
                         style="border: none;background: inherit;"> ${app.local.datasets_options_category}
                </label>
                <input class="options_label" type="text" value="${app.data.datasets[i].label}" id="category_${i}"
                       style="border: 1px solid #ccc; border-radius: 5px;">
            </div>
            <div class="input field">
                <label class="options_label" for="backgroundColor_${i}">
                    <img src="data/icons/${resource_background_color_image}" 
                         alt="${app.local.datasets_options_background_color}"
                         style="border: none;background: inherit;"> ${app.local.datasets_options_background_color}
                </label>
                <input type="color" class="color_input" value="${app.data.datasets[i].backgroundColor}" id="backgroundColor_${i}">
            </div>
            <div class="input field">
                <label class="options_label" for="borderColor_${i}">
                    <img src="data/icons/${resource_color_palette_image}" 
                         alt="${app.local.datasets_options_border_color}"
                         style="border: none;background: inherit;"> ${app.local.datasets_options_border_color}
                </label>
                <input type="color" class="color_input" value="${app.data.datasets[i].borderColor}" id="borderColor_${i}">
            </div>
            <div class="input field">
                <label class="options_label" for="borderWidth_${i}">
                    <img src="data/icons/${resource_border_width_image}"
                         alt="${app.local.datasets_options_border_width}"
                         style="border: none;background: inherit;"> ${app.local.datasets_options_border_width}
                </label>
                <select name="borderWidth_${i}" value="${app.data.datasets[i].borderWidth}" id="borderWidth_${i}">
                    ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => `<option value="${num}">${num}</option>`)}
                </select>
            </div>
            `;
            dataset_element.appendChild(options_element);
        }
        datasets.insertBefore(dataset_element, add_dataset_button.parentNode);

        // options
        const category_input = document.getElementById("category_"+i);
        category_input.custom_index = i;
        category_input.addEventListener("input", function(e){
            app.data.datasets[e.currentTarget.custom_index].label = category_input.value;
            chart.update();
            chart_save_state("app_data", app.data);
        });
        const background_color_input = document.getElementById("backgroundColor_"+i);
        background_color_input.custom_index = i;
        background_color_input.addEventListener("input", function(e){
            app.data.datasets[e.currentTarget.custom_index].backgroundColor = background_color_input.value;
            chart.update();
            chart_save_state("app_data", app.data);
        });
        const border_color_input = document.getElementById("borderColor_"+i);
        border_color_input.custom_index = i;
        border_color_input.addEventListener("input", function(e){
            app.data.datasets[e.currentTarget.custom_index].borderColor = border_color_input.value;
            chart.update();
            chart_save_state("app_data", app.data);
        });
        const border_width_input = document.getElementById("borderWidth_"+i);
        border_width_input.custom_index = i;
        border_width_input.addEventListener("input", function(e){
            app.data.datasets[e.currentTarget.custom_index].borderWidth = parseInt(border_width_input.value);
            chart.update();
            chart_save_state("app_data", app.data);
        });

        // input data
        const data_container = document.getElementById("Data"+i);
        const add_data_button = document.getElementById("add_data_"+i);
        
        for (var data_index = 0; data_index < app.data.datasets[i].data.length; ++data_index)
        {
            const field = document.createElement("div");
            field.setAttribute("class", "input field");

            const input = document.createElement("input");
            input.setAttribute("type", "text");
            input.setAttribute("value", app.data.datasets[i].data[data_index]);
            input.custom_index = data_index;
            input.custom_dataset_index = i;
            input.addEventListener("input", function(e){
                app.data.datasets[e.currentTarget.custom_dataset_index].data[e.currentTarget.custom_index] = input.value;
                chart.update();
                chart_save_state("app_data", app.data);
            });

            const x = document.createElement("img");
            x.src = "data/icons/" + resource_cancel_image;
            x.alt = app.local.datasets_options_remove_data_alt + i;
            x.title = app.local.datasets_options_remove_data_title;
            x.custom_index = data_index;
            x.custom_dataset_index = i;
            x.addEventListener("click", function(e){
                const nodes = Array.prototype.slice.call(data_container.children);
                const index = nodes.indexOf(field);
                app.data.datasets[e.currentTarget.custom_dataset_index].data.splice(index, 1);
                field.remove();
                chart.update();
                chart_save_state("app_data", app.data);
            });

            field.appendChild(input);
            field.appendChild(x);
            data_container.insertBefore(field, add_data_button.parentNode);
        }

        add_data_button.custom_dataset_index = i;
        add_data_button.addEventListener("click", function(e){
            const current_input_index = app.data.datasets[e.currentTarget.custom_dataset_index].data.length;
            const field = document.createElement("div");
            field.setAttribute("class", "input field");
            
            const input = document.createElement("input");
            input.setAttribute("type", "text");
            input.custom_index = current_input_index;
            input.custom_dataset_index = e.currentTarget.custom_dataset_index;
            input.addEventListener("input", function(e){
                app.data.datasets[e.currentTarget.custom_dataset_index].data[e.currentTarget.custom_index] = input.value;
                chart.update();
                chart_save_state("app_data", app.data);
            });

            const x = document.createElement("img");
            x.src = "data/icons/" + resource_cancel_image;
            x.alt = app.local.datasets_options_remove_data_alt + i;
            x.title = app.local.datasets_options_remove_data_title;
            x.custom_index = current_input_index;
            x.custom_dataset_index = e.currentTarget.custom_dataset_index;
            x.addEventListener("click", function(e){
                const nodes = Array.prototype.slice.call(data_container.children);
                const index = nodes.indexOf(field);
                app.data.datasets[e.currentTarget.custom_dataset_index].data.splice(index, 1);
                field.remove();
                chart.update();
                chart_save_state("app_data", app.data);
            });
            
            field.appendChild(input);
            field.appendChild(x);
            data_container.insertBefore(field, add_data_button.parentNode);
            
            app.data.datasets[e.currentTarget.custom_dataset_index].data.push(field.value);
            chart.update();
        });

        chart.update();
    }
}

function read_file_contents(file_data)
{
    if (file_data)
    {
        const reader = new FileReader();
        reader.readAsText(file_data, "UTF-8");
        return reader;
    }
}

function app_handle_file_upload(app, e)
{
    const files = e.target.files;
    const file = files[0];
    app.recent_name = file.name;
    if (file.type === "application/json")
    {
        // parse json
        const file_reader = read_file_contents(file);
        file_reader.onload = function(e){
            const contents = e.target.result;
            const json_data = JSON.parse(contents);
            chart_save_state("app_data", json_data);
            chart_save_state("app_recent_name", app.recent_name);
            location.reload();
        };
        file_reader.onerror = function(e){
            report_error(app, app.local.error_message_reading_file);
        };
    }
    else if (file.type === "text/csv")
    {
        // parse csv
        const file_reader = read_file_contents(file);
        file_reader.onload = function(e){
            const contents = e.target.result;
            const csv_data = contents.split('\n').map(line => line.split(','));
            const csv_data_to_reload = {
                labels: [],
                datasets: []
            };
            csv_data_to_reload.labels = csv_data[0].filter(el => el.trim());
            for (var i = 1; i < csv_data.length; i++)
            {
                // every dataset starts by "label" in csv files
                if (csv_data[i][0] === "label")
                {
                    const current_dataset = {
                        label: null,
                        fill: false,
                        backgroundColor: null,
                        borderColor: null,
                        borderWidth: 1,
                        data: []
                    };
                    current_dataset.label = csv_data[i][1].trim();
                    current_dataset.fill = csv_data[i+1][1].trim() === "true";
                    current_dataset.backgroundColor = csv_data[i+2][1].trim();
                    current_dataset.borderColor = csv_data[i+3][1].trim();
                    current_dataset.borderWidth = parseInt(csv_data[i+4][1]);
                    const [, ...rest] = (csv_data[i+5].filter(el => el.trim())).map(el => parseFloat(el));
                    current_dataset.data = rest;
                    csv_data_to_reload.datasets.push(current_dataset);
                }
            }
            chart_save_state("app_data", csv_data_to_reload);
            chart_save_state("app_recent_name", app.recent_name);
            location.reload();
        };
        file_reader.onerror = function(e){
            report_error(app, app.local.error_message_reading_file);
        };
    }
    else
    {
        report_error(app, app.local.error_message_unknown_file_type);
    }
}

function string_chop_extension(str)
{
    return str.split('.')[0];
}

function app_add_renderable_label(app, chart)
{
    const labels_container = document.getElementById("label_inputs");

    const current_label_index = app.data.labels.length;
    const label = document.createElement("div");
    label.setAttribute("class", "input field");
    
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", app.local.label_placeholder);
    input.custom_index = current_label_index;
    input.addEventListener("input", function(e){
        app.data.labels[e.currentTarget.custom_index] = input.value;
        chart.update();
        chart_save_state("app_data", app.data);
    });

    const x = document.createElement("img");
    x.src = "data/icons/" + resource_cancel_image;
    x.alt = app.local.label_remove_alt + current_label_index;
    x.title = app.local.label_remove_title;
    x.custom_index = current_label_index;
    x.addEventListener("click", function(e){
        const nodes = Array.prototype.slice.call(labels_container.children);
        const index = nodes.indexOf(label);
        chart_remove_label(app, index);
        label.remove();
        chart.update();
        chart_save_state("app_data", app.data);
    });
    
    label.appendChild(input);
    label.appendChild(x);
    const add_label_button = document.getElementById("add_label");
    labels_container.insertBefore(label, add_label_button.parentNode);
    
    chart_add_label(app);
    chart.update();
}

function app_add_renderable_dataset(app, chart)
{
    const add_dataset_button = document.getElementById("add_dataset");
    const datasets = document.getElementById("datasets");

    const current_dataset_index = app.data.datasets.length;
    app.data.datasets.push({
        label: app.local.label_new_name + current_dataset_index,
        fill: false,
        backgroundColor: "#6D63FF",
        borderColor: "#6D63FF",
        borderWidth: 1,
        data: [],
    });

    const dataset_element = document.createElement("div");
    dataset_element.setAttribute("class", "dataset");
    dataset_element.setAttribute("id", "dataset_"+current_dataset_index);
    {
        const tab_element = document.createElement("div");
        tab_element.setAttribute("class", "tab");
        var button_element = document.createElement("button");
        button_element.setAttribute("class", "tablinks tl"+current_dataset_index);
        button_element.setAttribute("type", "button");
        button_element.setAttribute("id", "default_open"+current_dataset_index);
        button_element.setAttribute("title", app.local.datasets_data_title);
        button_element.innerHTML = `<img src="data/icons/${resource_data_image}" alt="${app.local.datasets_data_title}">`;
        button_element.addEventListener("click", function(e){
            open_tab(e, "Data"+current_dataset_index, current_dataset_index);
        });
        tab_element.appendChild(button_element);

        button_element = document.createElement("button");
        button_element.setAttribute("class", "tablinks tl"+current_dataset_index);
        button_element.setAttribute("type", "button");
        button_element.setAttribute("title", app.local.datasets_options_title);
        button_element.innerHTML = `<img src="data/icons/${resource_options_image}" alt="${app.local.datasets_options_title}">`;
        button_element.addEventListener("click", function(e){
            open_tab(e, "Options"+current_dataset_index, current_dataset_index);
        });
        tab_element.appendChild(button_element);

        button_element = document.createElement("button");
        button_element.setAttribute("class", "tablinks tl"+current_dataset_index);
        button_element.setAttribute("type", "button");
        button_element.setAttribute("title", app.local.datasets_remove_title);
        button_element.innerHTML = `<img src="data/icons/${resource_remove_image}" alt="${app.local.datasets_remove_title}">`;
        button_element.addEventListener("click", function(e){
            app_dataset_remove(app, current_dataset_index);
            chart.update();
            chart_save_state("app_data", app.data);
        });
        tab_element.appendChild(button_element);

        dataset_element.appendChild(tab_element);

        const data_element = document.createElement("div");
        data_element.setAttribute("id", "Data"+current_dataset_index);
        data_element.setAttribute("class", "tabcontent tc" + current_dataset_index + " data_container");
        data_element.innerHTML = `
            <div class="field" style="flex: 100%;">
                <button type="button" id="add_data_${current_dataset_index}" title="${app.local.datasets_add_data_title}" style="display: flex; align-items: center;">
                    <img src="data/icons/${resource_add_data_image}" alt="${app.local.datasets_add_data_title}"> ${app.local.datasets_data_title}
                </button>
            </div>
        `;
        dataset_element.appendChild(data_element);

        const options_element = document.createElement("div");
        options_element.setAttribute("id", "Options"+current_dataset_index);
        options_element.setAttribute("class", "tabcontent tc"+current_dataset_index);
        options_element.setAttribute("style", "flex-direction: column;");
        options_element.innerHTML = `
        <div class="input field">
            <label class="options_label" for="category_${current_dataset_index}">
                <img src="data/icons/${resource_title_tag_image}"
                     alt="${app.local.datasets_options_category}"
                     style="border: none;background: inherit;"> ${app.local.datasets_options_category}
            </label>
            <input type="text" value="${app.data.datasets[current_dataset_index].label}" id="category_${current_dataset_index}"
                    style="border: 1px solid #ccc; border-radius: 5px;">
        </div>
        <div class="input field">
            <label class="options_label" for="backgroundColor_${current_dataset_index}">
                <img src="data/icons/${resource_background_color_image}"
                     alt="${app.local.datasets_options_background_color}"
                     style="border: none;background: inherit;"> ${app.local.datasets_options_background_color}
            </label>
            <input type="color" class="color_input" value="${app.data.datasets[current_dataset_index].backgroundColor}" id="backgroundColor_${current_dataset_index}">
        </div>
        <div class="input field">
            <label class="options_label" for="borderColor_${current_dataset_index}">
                <img src="data/icons/${resource_color_palette_image}"
                     alt="${app.local.datasets_options_border_color}"
                     style="border: none;background: inherit;"> ${app.local.datasets_options_border_color}
            </label>
            <input type="color" class="color_input" value="${app.data.datasets[current_dataset_index].borderColor}" id="borderColor_${current_dataset_index}">
        </div>
        <div class="input field">
            <label class="options_label" for="borderWidth_${current_dataset_index}">
                <img src="data/icons/${resource_border_width_image}"
                 alt="${app.local.datasets_options_border_width}"
                 style="border: none;background: inherit;"> ${app.local.datasets_options_border_width}
            </label>
            <select name="borderWidth_${current_dataset_index}" value="${app.data.datasets[current_dataset_index].borderWidth}" id="borderWidth_${current_dataset_index}">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => `<option value="${num}">${num}</option>`)}
            </select>
        </div>
        `;
        dataset_element.appendChild(options_element);
    }
    datasets.insertBefore(dataset_element, add_dataset_button.parentNode);

    // options
    const category_input = document.getElementById("category_"+current_dataset_index);
    category_input.addEventListener("input", function(e){
        app.data.datasets[current_dataset_index].label = category_input.value;
        chart.update();
        chart_save_state("app_data", app.data);
    });
    const background_color_input = document.getElementById("backgroundColor_"+current_dataset_index);
    background_color_input.addEventListener("input", function(e){
        app.data.datasets[current_dataset_index].backgroundColor = background_color_input.value;
        chart.update();
        chart_save_state("app_data", app.data);
    });
    const border_color_input = document.getElementById("borderColor_"+current_dataset_index);
    border_color_input.addEventListener("input", function(e){
        app.data.datasets[current_dataset_index].borderColor = border_color_input.value;
        chart.update();
        chart_save_state("app_data", app.data);
    });
    const border_width_input = document.getElementById("borderWidth_"+current_dataset_index);
    border_width_input.addEventListener("input", function(e){
        app.data.datasets[current_dataset_index].borderWidth = parseInt(border_width_input.value);
        chart.update();
        chart_save_state("app_data", app.data);
    });

    // input data
    const data_container = document.getElementById("Data"+current_dataset_index);
    const add_data_button = document.getElementById("add_data_"+current_dataset_index);
    add_data_button.addEventListener("click", function(e){
        const current_input_index = app.data.datasets[current_dataset_index].data.length;
        const field = document.createElement("div");
        field.setAttribute("class", "input field");
        
        const input = document.createElement("input");
        input.setAttribute("type", "text");
        input.custom_index = current_input_index;
        input.addEventListener("input", function(e){
            app.data.datasets[current_dataset_index].data[e.currentTarget.custom_index] = input.value;
            chart.update();
            chart_save_state("app_data", app.data);
        });

        const x = document.createElement("img");
        x.src = "data/icons/" + resource_cancel_image;
        x.alt = app.local.label_remove_alt + current_input_index;
        x.title = app.local.label_remove_title;
        x.custom_index = current_input_index;
        x.addEventListener("click", function(e){
            const nodes = Array.prototype.slice.call(data_container.children);
            const index = nodes.indexOf(field);
            app.data.datasets[current_dataset_index].data.splice(index, 1);
            field.remove();
            chart.update();
            chart_save_state("app_data", app.data);
        });
        
        field.appendChild(input);
        field.appendChild(x);
        data_container.insertBefore(field, add_data_button.parentNode);
        
        app.data.datasets[current_dataset_index].data.push(field.value);
        chart.update();
    });

    chart.update();
}

function app_handle_localization(app)
{
    app.local = language[app.lang];

    const menu_template = `
    <div class="dropdown">
        <button type="button" class="drop_button">${app.local.menu_file}</button>
        <div class="dropdown_content">
            <button type="button" id="menu_file_new">
                <img src="data/icons/Document_16x.png" alt="${app.local.menu_file_new}"> ${app.local.menu_file_new}
            </button>
            <div class="dropdown_separator"></div>
            <button type="button" id="menu_file_import">
                <img src="data/icons/FileSource_16x.png" alt="${app.local.menu_file_import}"> ${app.local.menu_file_import}
            </button>
            <div class="dropdown_separator"></div>
            <button type="button" id="menu_file_save_json">
                <img src="data/icons/AzureDocumentDBFile_16x.png" alt="${app.local.menu_file_save_json}"> ${app.local.menu_file_save_json}
            </button>
            <button type="button" id="menu_file_save_csv">
                <img src="data/icons/ExcelWorksheetView_16x.png" alt="${app.local.menu_file_save_csv}"> ${app.local.menu_file_save_csv}
            </button>
            <div class="dropdown_separator"></div>
            <button type="button" id="menu_file_snapshot">
                <img src="data/icons/Camera_16x.png" alt="${app.local.menu_file_snapshot}"> ${app.local.menu_file_snapshot}
            </button>
        </div>
    </div>
    <div class="dropdown">
        <button type="button" class="drop_button">${app.local.menu_edit}</button>
        <div class="dropdown_content">
            <button type="button" id="menu_edit_add_label">
                <img src="data/icons/AddClause_16x.png" alt="${app.local.menu_edit_add_label}"> ${app.local.menu_edit_add_label}
            </button>
            <div class="dropdown_separator"></div>
            <button type="button" id="menu_edit_add_dataset">
                <img src="data/icons/AddForm_16x.png" alt="${app.local.menu_edit_add_dataset}"> ${app.local.menu_edit_add_dataset}
            </button>
            <button type="button" id="menu_edit_add_additional_dataset">
                <img src="data/icons/AddFile_16x.png" alt="${app.local.menu_edit_add_additional_dataset}"> ${app.local.menu_edit_add_additional_dataset}
            </button>
        </div>
    </div>
    <div class="dropdown">
        <button type="button" class="drop_button">${app.local.menu_options}</button>
        <div class="dropdown_content">
            <div class="sub_dropdown" id="menu_options_language">
                <button type="button">
                    <img src="data/icons/Localize_16x.png" alt="${app.local.menu_options_language}"> ${app.local.menu_options_language}
                </button>
                <div class="sub_dropdown_content">
                    <button type="button" value="ar">${app.local.menu_options_language_ar}</button>
                    <button type="button" value="en">${app.local.menu_options_language_en}</button>
                    <button type="button" value="fr">${app.local.menu_options_language_fr}</button>
                </div>
            </div>
            <div class="dropdown_separator"></div>
            <div class="sub_dropdown" id="menu_options_chart_type">
                <button type="button">
                    <img src="data/icons/AreaChart_16x.png" alt="${app.local.menu_options_chart_type}"> ${app.local.menu_options_chart_type}
                </button>
                <div class="sub_dropdown_content">
                    <button type="button" value="line">
                        <img src="data/icons/LineChart_16x.png" alt="${app.local.menu_options_chart_type_line}"> ${app.local.menu_options_chart_type_line}
                    </button>
                    <button type="button" value="bar">
                        <img src="data/icons/ColumnChart_16x.png" alt="${app.local.menu_options_chart_type_bar}"> ${app.local.menu_options_chart_type_bar}
                    </button>
                    <button type="button" value="pie">
                        <img src="data/icons/PieChart_16x.png" alt="${app.local.menu_options_chart_type_pie}"> ${app.local.menu_options_chart_type_pie}
                    </button>
                    <button type="button" value="doughnut">
                        <img src="data/icons/DoughnutChart_16x.png" alt="${app.local.menu_options_chart_type_doughnut}"> ${app.local.menu_options_chart_type_doughnut}
                    </button>
                    <button type="button" value="radar">
                        <img src="data/icons/RadarChart_16x.png" alt="${app.local.menu_options_chart_type_radar}"> ${app.local.menu_options_chart_type_radar}
                    </button>
                    <button type="button" value="polarArea">
                        <img src="data/icons/PolarChart_16x.png" alt="${app.local.menu_options_chart_type_polar_area}"> ${app.local.menu_options_chart_type_polar_area}
                    </button>
                </div>
            </div>
            <div class="dropdown_separator"></div>
            <div class="sub_dropdown" id="menu_options_theme">
                <button type="button">
                    <img src="data/icons/DarkTheme_16x.png" alt="${app.local.menu_options_theme}"> ${app.local.menu_options_theme}
                </button>
                <div class="sub_dropdown_content">
                    <button type="button" value="light">${app.local.menu_options_theme_light}</button>
                    <button type="button" value="dark">${app.local.menu_options_theme_dark}</button>
                </div>
            </div>
        </div>
    </div>
    <div class="dropdown">
        <button type="button" class="drop_button">${app.local.menu_help}</button>
        <div class="dropdown_content">
            <button type="button" id="menu_help_info">${app.local.menu_help_info}</button>
            <div class="dropdown_separator"></div>
            <button type="button" id="menu_help_about">${app.local.menu_help_about}</button>
        </div>
    </div>
    `;
    const menu = document.getElementById("menu");
    menu.innerHTML += menu_template;

    const toolbar_template = 
    `
    <form id="tiny_form">
        <button type="button" id="import_json" title="${app.local.menu_file_import}">
            <img src="data/icons/FileSource_16x.png" alt="${app.local.menu_file_import}">
        </button>
        <button type="button" id="save_project", title="${app.local.menu_file_save_json}">
            <img src="data/icons/AzureDocumentDBFile_16x.png" alt="${app.local.menu_file_save_json}">
        </button>
        <button type="button" id="save_project2", title="${app.local.menu_file_save_csv}">
            <img src="data/icons/ExcelWorksheetView_16x.png" alt="${app.local.menu_file_save_csv}">
        </button>
        <button type="button" id="save_snapshot", title="${app.local.menu_file_snapshot}">
            <img src="data/icons/Camera_16x.png" alt="${app.local.menu_file_snapshot}">
        </button>
    </form>

    <div style="display: inline;">
        ${app.local.theme_name}:
        <button type="button" id="theme_ident" title="${app.local.theme_light}">
            <img src="data/icons/DarkTheme_16x.png" alt="${app.local.change_theme}">
        </button>
    </div>

    <div class="separator"></div>

    <div style="display: inline;">
        ${app.local.chart_name}:
        <select name="chart_type" id="chart_type" title="${app.local.menu_options_chart_type}">
            <option value="line">${app.local.menu_options_chart_type_line}</option>
            <option value="bar">${app.local.menu_options_chart_type_bar}</option>
            <option value="pie">${app.local.menu_options_chart_type_pie}</option>
            <option value="doughnut">${app.local.menu_options_chart_type_doughnut}</option>
            <option value="radar">${app.local.menu_options_chart_type_radar}</option>
            <option value="polarArea">${app.local.menu_options_chart_type_polar_area}</option>
        </select>
    </div>
    `;
    const toolbar = document.getElementById("toolbar");
    toolbar.innerHTML += toolbar_template;

    const labels_title = document.getElementById("labels_title");
    labels_title.innerHTML = app.local.labels_title;

    document.getElementById("add_label").title = app.local.add_label;
    document.getElementById("datasets_title").innerHTML = app.local.datasets_title;
    document.getElementById("add_dataset").title = app.local.add_dataset;
}

window.onload = function(event)
{
    const app = app_init();
    if (app)
    {
        console.log(app);
        var chart = null;
        chart = chart_draw(chart, app);

        app_handle_localization(app);

        const recent_name_element = document.getElementById("file_name").children[0];
        recent_name_element.innerHTML = app.recent_name;

        const theme_ident = document.getElementById("theme_ident");
        theme_ident.title = ((app.theme === "light") ? app.local.theme_light : app.local.theme_dark);
        theme_ident.value = app.theme;
        theme_ident.addEventListener("click", function(e){
            app.theme = ((theme_ident.value === "light") ? "dark" : "light");
            chart_save_state("app_theme", app.theme);
            location.reload();
        });

        const style = document.querySelector("link");
        style.href = "data/theme/" + theme_ident.value + ".css";

        const selection = document.getElementById("chart_type");
        selection.value = app.chart_type;

        app_render_labels_from_storage(app, chart);
        app_render_datasets_from_storage(app, chart);

        const add_label_button = document.getElementById("add_label");
        add_label_button.addEventListener("click", function(e){
            app_add_renderable_label(app, chart);
        });
        
        const add_dataset_button = document.getElementById("add_dataset");
        add_dataset_button.addEventListener("click", function(e){
            app_add_renderable_dataset(app, chart);
        });

        const chart_type = document.getElementById("chart_type");
        chart_type.addEventListener("input", function(e){
            app.chart_type = chart_type.value;
            chart_save_state("chart_type", app.chart_type);
            location.reload();
        });

        const def_open = document.getElementById("default_open0");
        if (def_open)
        {
            def_open.click();
        }

        const init_json_file_input = function(form, button)
        {
            const f = document.createElement("input");
            f.style.display = "none";
            f.type = "file";
            f.name="json_file";
            f.accept = ".json, .csv";
            form.insertBefore(f, button);
            return f;
        };
        
        const tiny_form = document.getElementById("tiny_form");
        const import_json_button = document.getElementById("import_json");
        const f = init_json_file_input(tiny_form, import_json_button);
        
        import_json_button.addEventListener("click", function(e){
            f.click();
            f.addEventListener("change", function(e){
                app_handle_file_upload(app, e);
            });
        });

        const setup_input_save_button = function()
        {
            const link = document.createElement("a");
            link.style.display = "none";
            return link;
        };
        
        const link = setup_input_save_button();
        
        const save_project_button_json = document.getElementById("save_project");
        save_project_button_json.addEventListener("click", function(e){
            const file = new Blob([JSON.stringify(app.data)], { type: "application/json;charset=utf-8" });

            var suggested_name = string_chop_extension(app.recent_name) + ".json";
            suggested_name = prompt(app.local.export_save_as, suggested_name);

            if (suggested_name)
            {
                link.href = URL.createObjectURL(file);
                link.download = suggested_name;
                link.click();
                URL.revokeObjectURL(link.href);
            }
        });

        const save_project_button_csv = document.getElementById("save_project2");
        save_project_button_csv.addEventListener("click", function(e){
            const csv_data = json_data_to_custom_csv_format(app.data);
            const file = new Blob([csv_data], { type: "text/csv;charset=utf-8" });

            var suggested_name = string_chop_extension(app.recent_name) + ".csv";
            suggested_name = prompt(app.local.export_save_as, suggested_name);

            if (suggested_name)
            {
                link.href = URL.createObjectURL(file);
                link.download = suggested_name;
                console.log(link);
                link.click();
                URL.revokeObjectURL(link.href);
            }
        });

        const save_snapshot_button = document.getElementById("save_snapshot");
        save_snapshot_button.addEventListener("click", function(e){
            const link = document.createElement("a");
            link.download = "snapshot.png";
            link.href = app.surface.toDataURL();
            link.click();
        });

        app_handle_collapsible_elements(app);

        app_handle_menu(app, chart, f, link);
    }
    else
    {
        console.log("Dev_Error: Failed to init the app");
    }
};

function json_data_to_custom_csv_format(json)
{
    var contents = json.labels.join(',');
    contents += ",\n\n";

    for (var i = 0; i < json.datasets.length; ++i)
    {
        const dataset = json.datasets[i];
        contents += "label, " + dataset.label + ",\n";
        contents += "fill, " + dataset.fill + ",\n";
        contents += "backgroundColor, " + dataset.backgroundColor + ",\n";
        contents += "borderColor, " + dataset.borderColor + ",\n";
        contents += "borderWidth, " + dataset.borderWidth + ",\n";
        
        contents += "data, ";
        contents += dataset.data.join(',');
        contents += ",\n";

        contents += '\n';
    }

    return contents;
}

function open_tab(event, name, index)
{
    const tabcontent = document.getElementsByClassName("tc"+index);
    for (var i = 0; i < tabcontent.length; ++i)
    {
        tabcontent[i].style.display = "none";
    }

    const tablinks = document.getElementsByClassName("tl"+index);
    for (var i = 0; i < tablinks.length; ++i)
    {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(name).style.display = "flex";
    event.currentTarget.className = " active";
}

function app_handle_collapsible_elements(app)
{
    const coll = document.getElementsByClassName("collapsible");
    for (var i = 0; i < coll.length; ++i)
    {
        coll[i].addEventListener("click", function(e){
            this.classList.toggle("active");
            const content = this.parentNode.nextElementSibling;
            if (content.style.display === "block")
            {
                content.style.display = "none";
                this.children[0].src = "data/icons/" + resource_expand_image;
                this.title = app.local.collapsible_expand;
            }
            else
            {
                content.style.display = "block";
                this.children[0].src = "data/icons/" + resource_collapse_image;
                this.title = app.local.collapsible_collapse;
            }
        });
    }
}

function app_handle_menu(app, chart, file_import, save_link)
{
    {   // file:
        const menu_file_new = document.getElementById("menu_file_new");
        menu_file_new.addEventListener("click", function(e){
            chart_reset();
            chart_save_state("app_theme", app.theme);
            chart_save_state("app_lang", app.lang);
            chart_save_state("chart_type", app.chart_type);
        });

        const menu_file_import = document.getElementById("menu_file_import");
        menu_file_import.addEventListener("click", function(e){
            file_import.click();
            file_import.addEventListener("change", function(e){
                app_handle_file_upload(app, e);
            });
        });

        const menu_file_save_json = document.getElementById("menu_file_save_json");
        menu_file_save_json.addEventListener("click", function(e){
            const file = new Blob([JSON.stringify(app.data)], { type: "application/json;charset=utf-8" });

            var suggested_name = string_chop_extension(app.recent_name) + ".json";
            suggested_name = prompt(app.local.export_save_as, suggested_name);

            if (suggested_name)
            {
                save_link.href = URL.createObjectURL(file);
                save_link.download = suggested_name;
                save_link.click();
                URL.revokeObjectURL(save_link.href);
            }
        });

        const menu_file_save_csv = document.getElementById("menu_file_save_csv");
        menu_file_save_csv.addEventListener("click", function(e){
            const csv_data = json_data_to_custom_csv_format(app.data);
            const file = new Blob([csv_data], { type: "text/csv;charset=utf-8" });

            var suggested_name = string_chop_extension(app.recent_name) + ".csv";
            suggested_name = prompt(app.local.export_save_as, suggested_name);

            if (suggested_name)
            {
                save_link.href = URL.createObjectURL(file);
                save_link.download = suggested_name;
                save_link.click();
                URL.revokeObjectURL(save_link.href);
            }
        });

        const menu_file_snapshot = document.getElementById("menu_file_snapshot");
        menu_file_snapshot.addEventListener("click", function(e){
            const link = document.createElement("a");
            link.download = "snapshot.png";
            link.href = app.surface.toDataURL();
            link.click();
        });
    }

    {   // Edit:
        const menu_edit_add_label = document.getElementById("menu_edit_add_label");
        menu_edit_add_label.addEventListener("click", function(e){
            app_add_renderable_label(app, chart);
        });

        const menu_edit_add_dataset = document.getElementById("menu_edit_add_dataset");
        menu_edit_add_dataset.addEventListener("click", function(e){
            app_add_renderable_dataset(app, chart);
        });

        const menu_edit_add_additional_dataset = document.getElementById("menu_edit_add_additional_dataset");
        menu_edit_add_additional_dataset.addEventListener("click", function(e){
            file_import.click();
            file_import.addEventListener("change", function(e){
                const files = e.target.files;
                const file = files[0];
                if (file.type === "application/json")
                {
                    // parse json
                    const file_reader = read_file_contents(file);
                    file_reader.onload = function(e){
                        const contents = e.target.result;
                        const json_data = JSON.parse(contents);
                        for (var i = 0; i < json_data.datasets.length; i++)
                        {
                            const ds = json_data.datasets[i];
                            app.data.datasets.push(ds);
                        }
                        chart_save_state("app_data", app.data);
                        location.reload();
                    };
                    file_reader.onerror = function(e){
                        report_error(app, app.local.error_message_reading_file);
                    };
                }
                else if (file.type === "text/csv")
                {
                    // parse csv
                    const file_reader = read_file_contents(file);
                    file_reader.onload = function(e){
                        const contents = e.target.result;
                        const csv_data = contents.split('\n').map(line => line.split(','));
                        const csv_data_to_reload = {
                            labels: [],
                            datasets: []
                        };
                        csv_data_to_reload.labels = csv_data[0].filter(el => el.trim());
                        for (var i = 1; i < csv_data.length; i++)
                        {
                            // every dataset starts by "label" in csv files
                            if (csv_data[i][0] === "label")
                            {
                                const current_dataset = {
                                    label: null,
                                    fill: false,
                                    backgroundColor: null,
                                    borderColor: null,
                                    borderWidth: 1,
                                    data: []
                                };
                                current_dataset.label = csv_data[i][1].trim();
                                current_dataset.fill = csv_data[i+1][1].trim() === "true";
                                current_dataset.backgroundColor = csv_data[i+2][1].trim();
                                current_dataset.borderColor = csv_data[i+3][1].trim();
                                current_dataset.borderWidth = parseInt(csv_data[i+4][1]);
                                const [, ...rest] = (csv_data[i+5].filter(el => el.trim())).map(el => parseFloat(el));
                                current_dataset.data = rest;
                                csv_data_to_reload.datasets.push(current_dataset);
                            }
                        }
                        for (var i = 0; i < csv_data_to_reload.datasets.length; i++)
                        {
                            const ds = csv_data_to_reload.datasets[i];
                            app.data.datasets.push(ds);
                        }
                        chart_save_state("app_data", app.data);
                        location.reload();
                    };
                    file_reader.onerror = function(e){
                        report_error(app, app.local.error_message_reading_file);
                    };
                }
                else
                {
                    report_error(app, app.local.error_message_unknown_file_type);
                }
            });
        });
    }

    {   // Options
        const menu_options_language = document.getElementById("menu_options_language");
        const language_buttons = menu_options_language.children[1].children;
        for (var i = 0; i < language_buttons.length; ++i)
        {
            const btn = language_buttons[i];

            if (app.lang === btn.value)
            {
                btn.innerHTML = `<img src="data/icons/Checkmark_16x.png" alt="${app.local.check_alt}"> ` + btn.innerHTML;
            }

            btn.addEventListener("click", function(e){
                chart_save_state("app_lang", btn.value);
                location.reload();
            });
        }

        const menu_options_chart_type = document.getElementById("menu_options_chart_type");
        const chart_buttons = menu_options_chart_type.children[1].children;
        for (var i = 0; i < chart_buttons.length; ++i)
        {
            const btn = chart_buttons[i];
            btn.addEventListener("click", function(e){
                chart_save_state("chart_type", btn.value)
                location.reload();
            });
        }

        const menu_options_theme = document.getElementById("menu_options_theme");
        const theme_buttons = menu_options_theme.children[1].children;
        for (var i = 0; i < theme_buttons.length; ++i)
        {
            const btn = theme_buttons[i];
            if (app.theme === btn.value)
            {
                btn.innerHTML = `<img src="data/icons/Checkmark_16x.png" alt="${app.local.check_alt}"> ` + btn.innerHTML;
            }
            btn.addEventListener("click", function(e){
                chart_save_state("app_theme", btn.value)
                location.reload();
            });
        }
    }

    {   // Help:
        const menu_help_info = document.getElementById("menu_help_info");
        menu_help_info.addEventListener("click", function(e){
            alert(app.local.menu_help_info_content);
        });

        const menu_help_about = document.getElementById("menu_help_about");
        menu_help_about.addEventListener("click", function(e){
            alert(app.local.menu_help_about_content);
        });
    }
}