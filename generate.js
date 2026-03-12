const fs = require('fs');
const talks = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

const schedule = [];
let currentTime = new Date();
currentTime.setHours(10, 0, 0, 0);

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

for (let i = 0; i < talks.length; i++) {
    const startTime = new Date(currentTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    schedule.push({ ...talks[i], startTime: formatTime(startTime), endTime: formatTime(endTime), type: 'talk' });

    currentTime = new Date(endTime.getTime() + 10 * 60 * 1000);

    if (i === 2) {
        const lunchStartTime = new Date(currentTime);
        const lunchEndTime = new Date(lunchStartTime.getTime() + 60 * 60 * 1000);
        schedule.push({ title: 'Lunch Break', startTime: formatTime(lunchStartTime), endTime: formatTime(lunchEndTime), type: 'break' });
        currentTime = new Date(lunchEndTime.getTime() + 10 * 60 * 1000);
    }
}

const allCategories = [...new Set(talks.flatMap(talk => talk.categories))];

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tech Talks 2026</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; background-color: #f4f7f6; color: #333; }
        .container { max-width: 900px; margin: 2rem auto; padding: 1rem; }
        header { text-align: center; margin-bottom: 2rem; }
        header h1 { font-size: 2.5rem; color: #2c3e50; margin-bottom: 0.5rem; }
        .filters { text-align: center; margin-bottom: 2rem; }
        .filter-btn { background-color: #fff; border: 1px solid #ddd; padding: 0.5rem 1rem; margin: 0.2rem; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { background-color: #e0e0e0; }
        .filter-btn.active { background-color: #3498db; color: #fff; border-color: #3498db; }
        .schedule-item { background: #fff; border-left: 5px solid #3498db; margin-bottom: 1.5rem; padding: 1.5rem; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .schedule-item.break { border-left-color: #e67e22; }
        .time { font-weight: bold; color: #3498db; font-size: 1.1rem; }
        .schedule-item.break .time { color: #e67e22; }
        h2 { font-size: 1.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .speakers { font-style: italic; color: #555; margin-bottom: 1rem; }
        .categories span { background-color: #ecf0f1; color: #7f8c8d; padding: 0.3rem 0.6rem; border-radius: 15px; font-size: 0.8rem; margin-right: 0.5rem; }
        footer { text-align: center; margin-top: 3rem; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Tech Talks 2026</h1>
            <p>A one-day event filled with inspiring technical talks.</p>
        </header>
        <div class="filters" id="filters">
            <button class="filter-btn active" data-category="all">All</button>
            ${allCategories.map(cat => `<button class="filter-btn" data-category="${cat}">${cat}</button>`).join('')}
        </div>
        <div id="schedule-container"></div>
    </div>
    <script>
        const scheduleData = ${JSON.stringify(schedule)};

        function renderSchedule(filterCategory = 'all') {
            const container = document.getElementById('schedule-container');
            container.innerHTML = '';
            const filteredData = filterCategory === 'all' 
                ? scheduleData 
                : scheduleData.filter(item => item.type === 'break' || (item.categories && item.categories.includes(filterCategory)));

            filteredData.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = \`schedule-item \${item.type}\`;
                
                let content = \`<div class="time">\${item.startTime} - \${item.endTime}</div>\`;
                content += \`<h2>\${item.title}</h2>\`;
                
                if (item.type === 'talk') {
                    content += \`<div class="speakers">\${item.speakers.join(', ')}</div>\`;
                    content += \`<p>\${item.description}</p>\`;
                    content += \`<div class="categories">\${item.categories.map(cat => \`<span>\${cat}</span>\`).join('')}</div>\`;
                }

                itemDiv.innerHTML = content;
                container.appendChild(itemDiv);
            });
        }

        document.getElementById('filters').addEventListener('click', function(e) {
            if (e.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                renderSchedule(e.target.dataset.category);
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            renderSchedule();
        });
    </script>
    <footer>
        <p>&copy; 2026 Tech Talks. All rights reserved.</p>
    </footer>
</body>
</html>
`;

fs.writeFileSync('index.html', html);
console.log('index.html generated successfully!');
