import Splide from "@splidejs/splide";
import Card from './components/card.js'
import EmojiStorage from './components/emoji-storage.js'
// import EmojiPicker from './components/emoji-picker.js'
import { emojis } from './components/emojis.js';
import { createApp } from "petite-vue";

const fmt = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'short'
});
const now = fmt.format(Date.now());

const slider = new Splide('.splide', {
    trimSpace: false,
    focus: 'center',
    autoWidth: true,
    gap: '1rem',
    pagination: false
})

const [prev, next] = Array.from(document.querySelectorAll('[class*="splide__arrow--"]'), el => el.querySelector('[data-date]'));
slider.on('moved', (...args) => {
    let [prevIndex,, finalIndex] = args;
    const slides = [...slider.root.querySelectorAll('.splide__slide')];

    let nextDate = '', prevDate = '';

    // Left over from some intensive debugging, leaving as is for now
    prevDate = slides[--prevIndex]?.dataset.date;
    nextDate = slides[++finalIndex]?.dataset.date;
    
    prev.textContent = prevDate;
    next.textContent = nextDate;
})

slider.on('ready', (...args) => {
    // For some reason, 'ready' doesn't mean *READY*, so this little change has to happen in an rFA
    requestAnimationFrame(() => {
        const slides = slider.root.querySelector('.splide__list').children
        next.textContent = [...slides][1]?.dataset.date
    })
})

slider.on('click', (slide, event) => {
    if (slide.index !== slider.index) {
        slider.go(slide.index);
    }
})

slider.mount();

let noticeVisible = false;

if (!EmojiStorage.length) {
    slider.add(Card({
        emoji: '🤷',
        mood: ``,
        date: '',
        classNames: 'notice'
    }));
    noticeVisible = true;
} else {
    Object.entries(EmojiStorage.getItems()).forEach(([date, data]) => {
        slider.add(Card(data), 0);
    });
}


const tomorrow = new Date();

tomorrow.setHours(24, 0, 0, 0);

const rel = new Intl.RelativeTimeFormat('en-US', {
    numeric: 'always'
});

const getTimeToTomorrow = () => {
    const timeleft = tomorrow.getTime() - Date.now();
    var hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));

    const [,hoursLeftNum, hoursLeftUnit] = rel.formatToParts(hours, 'hours');
    const [,minutesLeftNum, minutesLeftUnit] = rel.formatToParts(minutes, 'minutes');

    return {
        hours: `${hoursLeftNum.value} ${hoursLeftUnit.value}`,
        minutes: `${minutesLeftNum.value} ${minutesLeftUnit.value}`
    };
}



function Emojis(props) {
    const fmt = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'short'
    });

    return {
        get _date() {
            const n = Date.now();
            return {
                ts: n,
                date: fmt.format(n),
            };
        },
        _updateTime() {
            const { hours, minutes } = getTimeToTomorrow();

            this.hours = hours;
            this.minutes = minutes;
        },
        addEntry() {
            const {
                emotion,
            } = this
            
            const {
                ts,
                date
            } = this._date
            
            const data = {
                ts,
                date,
                mood: emotion.key,
                emoji: emotion.icon
            };

            EmojiStorage.addItem(date, data);
            slider.add(Card(data), 0);
            slider.refresh();
            
            if (this.noticeVisible) {
                let notice = document.querySelector('.notice:not([aria-hidden="true"]')
                slider.remove('.notice');
                notice.setAttribute('aria-hidden', 'true');
                notice.setAttribute('hidden', 'true')
                this.noticeVisible = false
            }

            this.activeControl = 0;

            this.alreadyLogged = true;
        }
    }
}

let alreadyLogged = EmojiStorage.hasDate(now);

function Footer() {
    /** @type HTMLDialogElement|null */
    const dialog = document.getElementById('about');

    return {
        open() {
            dialog.showModal();
        },
        close() {
            dialog.close();
        }
    }
}


const app = createApp({
    Emojis,
    noticeVisible,
    elements: {
        // Destination for the emoji picker
        row: document.getElementById('emojiRow'),
        emotions: document.getElementById('emotionRow')
    },
    set alreadyLogged(v) {
        alreadyLogged = v;
    },
    get alreadyLogged() {
        alreadyLogged = EmojiStorage.hasDate(now);
        
        if (alreadyLogged) this.updateTitle();

        return alreadyLogged;
    },
    icons: false,
    submit: false,
    emotion: null,
    updateTitle() {
        const { emoji } = EmojiStorage.getItems()[now];

        document.title = [emoji, document.title.split(' | ')[1]].join(' | ');
    },
    set activeControl(v) {
        this._active_control_ = v;
    },
    get activeControl() {
        return this.alreadyLogged ? null : (this._active_control_ || 0)
    },
    selectedEmoji: null,
    emojis,
    ...getTimeToTomorrow(),
    Footer
});


app.mount();