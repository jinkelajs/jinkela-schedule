# Jinkela-Schedule

## Install

```bash
npm install jinkela-schedule
```

## Usage

### new Schedule([args])

* `args` **Object** Set of configurable options to set. Can have the following fields:
  * `defaultValue` **Any** The default value.
  * `readonly` **Bool** Disable the schedule.
  * `width` **Number** The width of the schedule.
  * `left` **Date** The left edge of the schedule, defaults now.
  * `right` **Date** The right edge of the schedule, defaults now + 2day.
  * `step` **Number** The moving step, defaults (right - left) / 24.
  * `points` **Object&lt;Date&gt;** Show specials time point in schedule.

## Demo [Live](https://jinkelajs.github.io/jinkela-schedule/example.html)

```html
<meta charset="utf-8" />
<script src="https://unpkg.com/jinkela@1.2.19/umd.js"></script>
<script src="https://unpkg.com/jinkela-schedule@1.0.0/index.js"></script>
<script>
addEventListener('DOMContentLoaded', () => {

  let schedule = new Schedule({
    width: 500,
    left: new Date(2017, 7, 1),
    right: new Date(2017, 8, 1),
    step: 864E5,
    points: {
      立秋: new Date(2017, 7, 7),
      处暑: new Date(2017, 7, 23),
      九月: new Date(2017, 8, 1)
    },
    defaultValue: [ new Date(2017, 7, 5), new Date(2017, 7, 18) ]
  }).to(document.body);

});
</script>
```
