图片添加超链接

```
  slide.addImage(
    './image/click_for_more.png',
    {
      link: https://www.button.tech/product/fda-project/${project.id},
      cx: '12.59%',
      cy: 23,
```

# officegen [![npm version](https://badge.fury.io/js/officegen.svg)](https://badge.fury.io/js/officegen) [![Build Status](https://travis-ci.org/Ziv-Barber/officegen.png?branch=master)](https://travis-ci.org/Ziv-Barber/officegen) [![Join the chat at https://gitter.im/officegen/Lobby](https://badges.gitter.im/officegen/Lobby.svg)](https://gitter.im/officegen/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This module can generate Office Open XML files for Microsoft Office 2007 and later. This module is not depend on any framework and you don't need to install Microsoft Office, so you can use it for any kind of javascript application. Also the output is a stream and not a file, not dependent on any output tool. This module should work on any environment that supports Node.js 0.10 or later including Linux, OSX and Windows.

[Trello](https://trello.com/b/dkaiSGir/officegen-make-office-documents-in-javascript)

This module generates Excel (.xlsx), PowerPoint (.pptx) and Word (.docx) documents. Officegen also supporting PowerPoint native charts objects with embedded data.

## Contents:

- [Features](https://www.npmjs.com/package/officegen#a1)
- [Installation](https://www.npmjs.com/package/officegen#a2)
- [Public API](https://www.npmjs.com/package/officegen#a3)
- [Examples](https://www.npmjs.com/package/officegen#a4)
- [The source](https://www.npmjs.com/package/officegen#a5)
- [FAQ](https://www.npmjs.com/package/officegen#a6)
- [Support](https://www.npmjs.com/package/officegen#a7)
- [Changelog](https://www.npmjs.com/package/officegen#a8)
- [License](https://www.npmjs.com/package/officegen#a10)
- [Credit](https://www.npmjs.com/package/officegen#a11)



## Features:

- Generating Microsoft PowerPoint document (.pptx file):
  - Create PowerPoint document with one or more slides.
  - Support both PPT and PPS.
  - Can create native charts.
  - Add text blocks.
  - Add images.
  - Can declare fonts, alignment, colors and background.
  - You can rotate objects.
  - Support shapes: Ellipse, Rectangle, Line, Arrows, etc.
  - Support hidden slides.
  - Support automatic fields like date, time and current slide number.
  - Support speaker notes.
  - Support slide layouts.
- Generating Microsoft Word document (.docx file):
  - Create Word document.
  - You can add one or more paragraphs to the document and you can set the fonts, colors, alignment, etc.
  - You can add images.
  - Support header and footer.
  - Support bookmarks and hyperlinks.
- Generating Microsoft Excel document (.xlsx file):
  - Create Excel document with one or more sheets. Supporting cells with either numbers or strings.



## Installation:

via Git:

```
$ git clone git://github.com/Ziv-Barber/officegen.git
```

via npm:

```
$ npm install officegen
```

If you are enthusiastic about using the latest that officegen has to offer (beware - may be unstable), you can install directly from the officegen repository using:

```
$ npm install Ziv-Barber/officegen#master
```

This module is depending on:

- archiver
- setimmediate
- fast-image-size
- xmlbuilder
- lodash



## Public API:

### Creating the document object:

```
var officegen = require('officegen');
```

There are two ways to use the officegen returned function to create the document object:

```
var myDoc = officegen ( '<type of document to create>' );
 
var myDoc = officegen ({
  'type': '<type of document to create>'
  // More options here (if needed)
});
```

Generating PowerPoint 2007 object:

```
var pptx = officegen ( 'pptx' );
```

Generating Word 2007 object:

```
var docx = officegen ( 'docx' );
```

Generating Excel 2007 object:

```
var xlsx = officegen ( 'xlsx' );
```

General events of officegen:

- 'finalize' - been called after finishing to create the document.
- 'error' - been called on error.

Event examples:

```
pptx.on ( 'finalize', function ( written ) {
      console.log ( 'Finish to create a PowerPoint file.\nTotal bytes created: ' + written + '\n' );
    });
 
pptx.on ( 'error', function ( err ) {
      console.log ( err );
    });
```

Another way to register either 'finalize' or 'error' events:

```
var pptx = officegen ({
    'type': 'pptx', // or 'xlsx', etc
    'onend': function ( written ) {
        console.log ( 'Finish to create a PowerPoint file.\nTotal bytes created: ' + written + '\n' );
    },
    'onerr': function ( err ) {
        console.log ( err );
    }
});
```

If you are preferring to use callbacks instead of events you can pass your callbacks to the generate method (see below).

Now you should fill the object with data (we'll see below) and then you should call generate with an output stream to create the output Office document.

Example with pptx:

```
var out = fs.createWriteStream ( 'out.pptx' );
 
pptx.generate ( out );
out.on ( 'close', function () {
  console.log ( 'Finished to create the PPTX file!' );
});
```

Passing callbacks to generate:

```
var out = fs.createWriteStream ( 'out.pptx' );
 
pptx.generate ( out, {
  'finalize': function ( written ) {
    console.log ( 'Finish to create a PowerPoint file.\nTotal bytes created: ' + written + '\n' );
  },
  'error': function ( err ) {
    console.log ( err );
  }
});
```

Generating HTTP stream (no file been created):

```
var http = require("http");
var officegen = require('officegen');
 
http.createServer ( function ( request, response ) {
  response.writeHead ( 200, {
    "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    'Content-disposition': 'attachment; filename=surprise.pptx'
    });
 
  var pptx = officegen ( 'pptx' );
 
  pptx.on ( 'finalize', function ( written ) {
      // ...
      });
 
  pptx.on ( 'error', function ( err ) {
      // ...
      });
 
  // ... (fill pptx with data)
 
  pptx.generate ( response );
}).listen ( 3000 );
```

### Put data inside the document object:

#### MS-Office document properties (for all document types):

The default Author of all the documents been created by officegen is 'officegen'. If you want to put anything else please use the 'creator' option when calling the officegen function:

```
var pptx = officegen ({
    'type': 'pptx', // or 'xlsx', etc
    'creator': '<your project name here>'
});
```

Change the document title (pptx,ppsx,docx):

```
var pptx = officegen ({
    'type': 'pptx',
    'title': '<title>'
});
 
// or
 
pptx.setDocTitle ( '<title>' );
```

For Word only:

```
var docx = officegen ({
    'type': 'docx',
    'subject': '...',
    'keywords': '...',
    'description': '...'
});
 
// or
 
docx.setDocSubject ( '...' );
docx.setDocKeywords ( '...' );
docx.setDescription ( '...' );
```

#### PowerPoint:

Setting slide size:

```
pptx.setSlideSize ( cx, cy, type )
```

Arguments:

- cx - width of the slide (in pixels)
- cy - height of the slide (in pixels)
- Supported types:
  - '35mm'
  - 'A3'
  - 'A4'
  - 'B4ISO'
  - 'B4JIS'
  - 'B5ISO'
  - 'B5JIS'
  - 'banner'
  - 'custom'
  - 'hagakiCard'
  - 'ledger'
  - 'letter'
  - 'overhead'
  - 'screen16x10'
  - 'screen16x9'
  - 'screen4x3'

Creating a new slide:

```
slide = pptx.makeNewSlide ();
```

For creating a new slide using a layout:

```
slide = pptx.makeNewSlide ({
    userLayout: 'title'
});
slide.setTitle ( 'The title' );
slide.setSubTitle ( 'Another text' ); // For either 'title' and 'secHead' only.
// for 'obj' layout use slide.setObjData ( ... ) to change the object element inside the slide.
```

userLayout can be:

- 'title': the first layout of Office (title).
- 'obj': the 2nd layout of Office (with one title and one object).
- 'secHead': the 3rd layout of Office.

Or more advance example:

```
slide = pptx.makeNewSlide ({
    userLayout: 'title'
});
// Both setTitle and setSubTitle excepting all the parameters that you can pass to slide.addText - see below:
slide.setTitle ([
    // This array is like a paragraph and you can use any settings that you pass for creating a paragraph,
    // Each object here is like a call to addText:
    { text: 'Hello ', options: { font_size: 56 } },
    { text: 'World!', options: { font_size: 56, font_face: 'Arial', color: 'ffff00' } }
]);
```

The returned object from makeNewSlide representing a single slide. Use it to add objects into this slide. You must create at last one slide on your pptx/ppsx document.

Inside each slide you can place objects, for example: text box, shapes, images, etc.

Properties of the slide object itself:

- "name" - name for this slide.
- "back" - the background color.
- "color" - the default font color to use.
- "show" - change this property to false if you want to disable this slide.

The slide object supporting the following methods:

- addText ( text, options )
- addShape ( shape, options )
- addImage ( image, options )
- addChart ( chartInfo )
- addTable ( rowsSpec, options )

Read only methods:

- getPageNumber - return the ID of this slide.

Common properties that can be added to the options object for all the add based methods:

- x - start horizontal position. Can be either number, percentage or 'c' to center this object (horizontal).
- y - start vertical position. Can be either number, percentage or 'c' to center this object (vertical).
- cx - the horizontal size of this object. Can be either number or percentage of the total horizontal size.
- cy - the vertical size of this object. Can be either number or percentage of the total vertical size.
- color - the font color for text.
- fill - the background color.
- line - border color / line color.
- flip_vertical: true - flip the object vertical.
- flip_horizontal: true - flip the object horizontal
- shape - see below.

Font properties:

- font_face
- font_size (in points)
- bold: true
- underline: true
- char_spacing: floating point number (kerning)
- baseline: percent (of font size). Used for superscript and subscript.

Text alignment properties:

- align - can be either 'left' (default), 'right', 'center' or 'justify'.
- indentLevel - indent level (number: 0+, default = 0).

Line/border extra properties (only effecting if the 'line' property exist):

- 'line_size' - line width in pixels.
- 'line_head' - the shape name of the line's head side (either: 'triangle', 'stealth', etc).
- 'line_tail' - the shape name of the line's tail side (either: 'triangle', 'stealth', etc).

The 'shape' property:

Normally every object is a rectangle but you can change that for every object using the shape property, or in case that you don't need to write any text inside that object, you can use the addShape method instead of addText. Use the shape property only if you want to use a shape other then the default and you also want to add text inside it.

Shapes list:

- 'rect' (default) - rectangle.
- 'ellipse'
- 'roundRect' - round rectangle.
- 'triangle'
- 'line' - draw line.
- 'cloud'
- 'hexagon'
- 'flowChartInputOutput'
- 'wedgeEllipseCallout'
- (much more shapes already supported - I'll update this list later)

Please note that every color property can be either:

- String of the color code. For example: 'ffffff', '000000', '888800', etc.
- Color object:
  - 'type' - The type of the color fill to use. Right now only 'solid' and 'gradient' supported.
  - 'color' - String with the color code to use.
  - 'alpha' - transparent level (0-100).
- For 'gradient' fill:
  - 'color' - Array of strings with the color code to use OR array of object, each object include "color" and "position" parameters. i.e. `[{"position": 0, "color": '000000'}, {}, ...]`
  - 'alpha' - transparent level (0-100).
  - 'angle' - (optional) the angle of gradient rotation

Adding images:

Just pass the image file name as the first parameter to addImage and the 2nd parameter, which is optional, is normal options objects and you can use all the common properties ('cx', 'cy', 'y', 'x', etc).

Examples:

Changing the background color of a slide:

```
slide.back = '000088';
```

or:

```
slide.back = { type: 'solid', color: '008800' };
```

Examples how to put text inside the new slide:

```
// Change the background color:
slide.back = '000000';
 
// Declare the default color to use on this slide (default is black):
slide.color = 'ffffff';
 
// Basic way to add text string:
slide.addText ( 'This is a test' );
slide.addText ( 'Fast position', 0, 20 );
slide.addText ( 'Full line', 0, 40, '100%', 20 );
 
// Add text box with multi colors and fonts:
slide.addText ( [
  { text: 'Hello ', options: { font_size: 56 } },
  { text: 'World!', options: { font_size: 56, font_face: 'Arial', color: 'ffff00' } }
  ], { cx: '75%', cy: 66, y: 150 } );
// Please note that you can pass object as the text parameter to addText.
 
slide.addText ( 'Office generator', {
  y: 66, x: 'c', cx: '50%', cy: 60, font_size: 48,
  color: '0000ff' } );
 
slide.addText ( 'Big Red', {
  y: 250, x: 10, cx: '70%',
  font_face: 'Wide Latin', font_size: 54,
  color: 'cc0000', bold: true, underline: true } );
```

#### Speaker notes:

PowerPoint slides can contain speaker notes, to do that use the setSpeakerNote method:

```
slide.setSpeakerNote ( 'This is a speaker note!' );
```

#### Charts:

PowerPoint slides can contain charts with embedded data. To create a chart:

```
slide.addChart( chartInfo)
```

Where `chartInfo` object is an object that takes the following attributes:

- `data` - an array of data, see examples below
- `renderType` - specifies base chart type, may be one of `"bar", "pie", "group-bar", "column", "stacked-column", "line"`
- `title` - chart title (default: none)
- `valAxisTitle` - value axis title (default: none)
- `catAxisTitle` - category axis title (default: none)
- `valAxisMinValue` - value axis min (default: none)
- `valAxisMaxValue` - vlaue axis max value (default: none)
- `valAxisNumFmt` - value axis format, e.g `"$0"` or `"0%"` (default: none)
- `valAxisMajorGridlines` - true|false (false)
- `valAxisMinorGridlines` - true|false (false)
- `valAxisCrossAtMaxCategory` - true|false (false)
- `catAxisReverseOrder` - true|false (false)
- `fontSize` - text size for chart, e.g. "1200" for 12pt type
- `xml` - optional XML overrides to `<c:chart>` as a Javascript object that is mixed in

Also, the overall chart and each data series take an an optional `xml` attribute, which specifies XML overrides to the `<c:series>` attribute.

- The `xml` argument for the `chartInfo` is mixed in to the `c:chartSpace` attribute.
- The `xml` argument for the `data` series is mixed into the `c:ser` attribute.

For instance, to specify the overall text size, you can specify the following on the `chartInfo`object. The snippet below is what happens under the scenes when you specify `fontSize: 1200`

```
chartInfo = {
 // ....
 "xml": {
      "c:txPr": {
        "a:bodyPr": {},
        "a:listStyle": {},
        "a:p": {
          "a:pPr": {
            "a:defRPr": {
              "@sz": "1200"
            }
          },
          "a:endParaRPr": {
            "@lang": "en-US"
          }
        }
      }
    }
```

Examples how to add chart into the slide:

```
// Column chart
slide = pptx.makeNewSlide();
slide.name = 'Chart slide';
slide.back = 'ffffff';
slide.addChart(
  {   title: 'Column chart',
          renderType: 'column',
          valAxisTitle: 'Costs/Revenues ($)',
          catAxisTitle: 'Category',
          valAxisNumFmt: '$0',
                valAxisMaxValue: 24,
    data:  [ // each item is one serie
    {
      name: 'Income',
      labels: ['2005', '2006', '2007', '2008', '2009'],
      values: [23.5, 26.2, 30.1, 29.5, 24.6],
      color: 'ff0000' // optional
    },
    {
      name: 'Expense',
      labels: ['2005', '2006', '2007', '2008', '2009'],
      values: [18.1, 22.8, 23.9, 25.1, 25],
      color: '00ff00' // optional
    }]
  }
)
 
// Pie chart
slide = pptx.makeNewSlide();
slide.name = 'Pie Chart slide';
slide.back = 'ffff00';
slide.addChart(
  {   title: 'My production',
      renderType: 'pie',
    data:  [ // each item is one serie
    {
      name: 'Oil',
      labels: ['Czech Republic', 'Ireland', 'Germany', 'Australia', 'Austria', 'UK', 'Belgium'],
      values: [301, 201, 165, 139, 128,  99, 60],
      colors: ['ff0000', '00ff00', '0000ff', 'ffff00', 'ff00ff', '00ffff', '000000'] // optional
    }]
  }
)
 
// Bar Chart
slide = pptx.makeNewSlide();
slide.name = 'Bar Chart slide';
slide.back = 'ff00ff';
slide.addChart(
  { title: 'Sample bar chart',
    renderType: 'bar',
      data:  [ // each item is one serie
      {
        name: 'europe',
        labels: ['Y2003', 'Y2004', 'Y2005'],
        values: [2.5, 2.6, 2.8],
        color: 'ff0000' // optional
      },
      {
        name: 'namerica',
        labels: ['Y2003', 'Y2004', 'Y2005'],
        values: [2.5, 2.7, 2.9],
        color: '00ff00' // optional
      },
      {
        name: 'asia',
        labels: ['Y2003', 'Y2004', 'Y2005'],
        values: [2.1, 2.2, 2.4],
        color: '0000ff' // optional
      },
      {
        name: 'lamerica',
        labels: ['Y2003', 'Y2004', 'Y2005'],
        values: [0.3, 0.3, 0.3],
        color: 'ffff00' // optional
      },
      {
        name: 'meast',
        labels: ['Y2003', 'Y2004', 'Y2005'],
        values: [0.2, 0.3, 0.3],
        color: 'ff00ff' // optional
      },
      {
        name: 'africa',
        labels: ['Y2003', 'Y2004', 'Y2005'],
        values: [0.1, 0.1, 0.1],
        color: '00ffff' // optional
      }
 
    ]
  }
)
 
// Line Chart
slide = pptx.makeNewSlide();
slide.name = 'Line Chart slide';
slide.back = 'ff00ff';
slide.addChart(
  { title: 'Sample line chart',
    renderType: 'line',
      data:  [ // each item is one serie
      {
        name: 'europe',
        labels: ['Y2003', 'Y2004', 'Y2005', 'Y2006'],
        values: [2.5, 2.6, 2.8, 2.4],
        color: 'ff0000' // optional
      },
      {
        name: 'namerica',
        labels: ['Y2003', 'Y2004', 'Y2005', 'Y2006'],
        values: [2.5, 2.7, 2.9, 3.2],
        color: '00ff00' // optional
      },
      {
        name: 'asia',
        labels: ['Y2003', 'Y2004', 'Y2005', 'Y2006'],
        values: [2.1, 2.2, 2.4, 2.2],
        color: '0000ff' // optional
      }
    ]
  }
)
```

#### Tables:

Add a table to a PowerPoint slide:

```
 var rows = [];
  for (var i = 0; i < 12; i++) {
    var row = [];
    for (var j = 0; j < 5; j++) {
      row.push("[" + i + "," + j + "]");
    }
    rows.push(row);
  }
  slide.addTable(rows, {});
```

Specific options for tables (in addition to standard : x, y, cx, cy, etc.) :

- columnWidth : width of all columns (same size for all columns). Must be a number (~1 000 000)
- columnWidths : list of width for each columns (custom size per column). Must be array of number. This param will overwrite columnWidth if both are given

Formatting can also be applied directly to a cell:

```
var rows = [];
rows.push([
    {
        val: "Category",
        	opts: {
          		font_face   : "Arial",
          		align       : "l",
          		bold        : 0
        	}
      },
      {
        	val  :"Average Score",
        	opts: {
          		font_face   : "Arial",
          		align       : "r",
          		bold        : 1,
          		font_color  : "000000",
          		fill_color  : "f5f5f5"
        	}
      }
]);
slide.addTable(rows, {});
```

## Word:

All the text data in Word is saved in paragraphs. To add a new paragraph:

```
var pObj = docx.createP ();
```

Paragraph options:

```
pObj.options.align = 'center'; // Also 'right' or 'justify'.
pObj.options.indentLeft = 1440; // Indent left 1 inch
```

Every list item is also a paragraph so:

```
var pObj = docx.createListOfDots ();
 
var pObj = docx.createListOfNumbers ();
```

Now you can fill the paragraph object with one or more text strings using the addText method:

```
pObj.addText ( 'Simple' );
 
pObj.addText ( ' with color', { color: '000088' } );
 
pObj.addText ( ' and back color.', { color: '00ffff', back: '000088' } );
 
pObj.addText ( 'Bold + underline', { bold: true, underline: true } );
 
pObj.addText ( 'Fonts face only.', { font_face: 'Arial' } );
 
pObj.addText ( ' Fonts face and size. ', { font_face: 'Arial', font_size: 40 } );
 
pObj.addText ( 'External link', { link: 'https://github.com' } );
 
// Hyperlinks to bookmarks also supported:
pObj.addText ( 'Internal link', { hyperlink: 'myBookmark' } );
// ...
// Start somewhere a bookmark:
pObj.startBookmark ( 'myBookmark' );
// ...
// You MUST close your bookmark:
pObj.endBookmark ();
```

Add an image to a paragraph:

```
var path = require('path');

pObj.addImage ( path.resolve(__dirname, 'myFile.png' ) );
pObj.addImage ( path.resolve(__dirname, 'myFile.png', { cx: 300, cy: 200 } ) );
```

To add a line break;

```
var pObj = docx.createP ();
pObj.addLineBreak ();
```

To add a page break:

```
docx.putPageBreak ();
```

To add a horizontal line:

```
var pObj = docx.createP ();
pObj.addHorizontalLine ();
```

To add a back line:

```
var pObj = docx.createP ({ backline: 'E0E0E0' });
pObj.addText ( 'Backline text1' );
pObj.addText ( ' text2' );
```

To add a table:

```
var table = [
  [{
    val: "No.",
    opts: {
      cellColWidth: 4261,
      b:true,
      sz: '48',
      shd: {
        fill: "7F7F7F",
        themeFill: "text1",
        "themeFillTint": "80"
      },
      fontFamily: "Avenir Book"
    }
  },{
    val: "Title1",
    opts: {
      b:true,
      color: "A00000",
      align: "right",
      shd: {
        fill: "92CDDC",
        themeFill: "text1",
        "themeFillTint": "80"
      }
    }
  },{
    val: "Title2",
    opts: {
      align: "center",
      vAlign: "center",
      cellColWidth: 42,
      b:true,
      sz: '48',
      shd: {
        fill: "92CDDC",
        themeFill: "text1",
        "themeFillTint": "80"
      }
    }
  }],
  [1,'All grown-ups were once children',''],
  [2,'there is no harm in putting off a piece of work until another day.',''],
  [3,'But when it is a matter of baobabs, that always means a catastrophe.',''],
  [4,'watch out for the baobabs!','END'],
]
 
var tableStyle = {
  tableColWidth: 4261,
  tableSize: 24,
  tableColor: "ada",
  tableAlign: "left",
  tableFontFamily: "Comic Sans MS",
  borders: true
}
 
docx.createTable (table, tableStyle);
```

Header and footer:

```
// Add a header:
var header = docx.getHeader ().createP ();
header.addText ( 'This is the header' );
// Please note that the object header here is a paragraph object so you can use ANY of the paragraph API methods also for header and footer.
// The getHeader () method excepting a string parameter:
// getHeader ( 'even' ) - change the header for even pages.
// getHeader ( 'first' ) - change the header for the first page only.
// to do all of that for the footer, use the getFooter instead of getHeader.
// and sorry, right now only createP is supported (so only creating a paragraph) so no tables, etc.
```

To Create Word Document by json:

```
var table = [
    [{
        val: "No.",
        opts: {
            cellColWidth: 4261,
            b:true,
            sz: '48',
            shd: {
                fill: "7F7F7F",
                themeFill: "text1",
                "themeFillTint": "80"
            },
            fontFamily: "Avenir Book"
        }
    },{
        val: "Title1",
        opts: {
            b:true,
            color: "A00000",
            align: "right",
            shd: {
                fill: "92CDDC",
                themeFill: "text1",
                "themeFillTint": "80"
            }
        }
    },{
        val: "Title2",
        opts: {
            align: "center",
            cellColWidth: 42,
            b:true,
            sz: '48',
            shd: {
                fill: "92CDDC",
                themeFill: "text1",
                "themeFillTint": "80"
            }
        }
    }],
    [1,'All grown-ups were once children',''],
    [2,'there is no harm in putting off a piece of work until another day.',''],
    [3,'But when it is a matter of baobabs, that always means a catastrophe.',''],
    [4,'watch out for the baobabs!','END'],
]
 
var tableStyle = {
    tableColWidth: 4261,
    tableSize: 24,
    tableColor: "ada",
    tableAlign: "left",
    tableFontFamily: "Comic Sans MS"
}
 
var data = [[{
        type: "text",
        val: "Simple"
    }, {
        type: "text",
        val: " with color",
        opt: { color: '000088' }
    }, {
        type: "text",
        val: "  and back color.",
        opt: { color: '00ffff', back: '000088' }
    }, {
        type: "linebreak"
    }, {
        type: "text",
        val: "Bold + underline",
        opt: { bold: true, underline: true }
    }], {
        type: "horizontalline"
    }, [{ backline: 'EDEDED' }, {
        type: "text",
        val: "  backline text1.",
        opt: { bold: true }
    }, {
        type: "text",
        val: "  backline text2.",
        opt: { color: '000088' }
    }], {
        type: "text",
        val: "Left this text.",
        lopt: { align: 'left' }
    }, {
        type: "text",
        val: "Center this text.",
        lopt: { align: 'center' }
    }, {
        type: "text",
        val: "Right this text.",
        lopt: { align: 'right' }
    }, {
        type: "text",
        val: "Fonts face only.",
        opt: { font_face: 'Arial' }
    }, {
        type: "text",
        val: "Fonts face and size.",
        opt: { font_face: 'Arial', font_size: 40 }
    }, {
        type: "table",
        val: table,
        opt: tableStyle
    }, [{ // arr[0] is common option.
        align: 'right'
    }, {
        type: "image",
        path: path.resolve(__dirname, 'images_for_examples/sword_001.png')
    },{
        type: "image",
        path: path.resolve(__dirname, 'images_for_examples/sword_002.png')
    }], {
        type: "pagebreak"
    }
]
 
docx.createByJson(data);
```

#### Excel:

```
sheet = xlsx.makeNewSheet ();
sheet.name = 'My Excel Data';
```

Fill cells:

```
// Using setCell:
sheet.setCell ( 'E7', 340 );
sheet.setCell ( 'G102', 'Hello World!' );
 
// Direct way:
sheet.data[0] = [];
sheet.data[0][0] = 1;
sheet.data[0][1] = 2;
sheet.data[1] = [];
sheet.data[1][3] = 'abc';
```



## Examples:

- [make_pptx.js](https://github.com/Ziv-Barber/officegen/blob/HEAD/examples/make_pptx.js) - Example how to create PowerPoint 2007 presentation and save it into file.
- [make_xlsx.js](https://github.com/Ziv-Barber/officegen/blob/HEAD/examples/make_xlsx.js) - Example how to create Excel 2007 sheet and save it into file.
- [make_docx.js](https://github.com/Ziv-Barber/officegen/blob/HEAD/examples/make_docx.js) - Example how to create Word 2007 document and save it into file.
- [pptx_server.js](https://github.com/Ziv-Barber/officegen/blob/HEAD/examples/pptx_server.js) - Example HTTP server that generating a PowerPoint file with your name without using files on the server side.



## Hackers Wonderland:

#### How to hack into the code

You can check the jsdoc documentation:

```
grunt jsdoc
```

#### Testing

A basic test suite creates XLSX, PPTX, DOCX files and compares them to reference file located under `test_files`. To run the tests, run the following at the command line within the project root:

```
npm test
```

#### Debugging

If needed, you can activate some verbose messages (warning: this does not cover all part of the lib yet) with :

```
officegen.setVerboseMode(true);
```



## FAQ:

- Q: Do you support also PPSX files?
- A: Yes! Just pass the type 'ppsx' to makegen instead of 'pptx'.



## Support:

Please visit the officegen Google Group:

[officegen Google Group](https://groups.google.com/forum/?fromgroups#!forum/node-officegen)

Plans for the next release: [Trello](https://trello.com/b/dkaiSGir/officegen-make-office-documents-in-javascript)

The Slack team: [Slack](https://zivbarber.slack.com/messages/officegen/)



## History:

[Changelog](https://github.com/Ziv-Barber/officegen/blob/master/CHANGELOG)





## License:

(The MIT License)

Copyright (c) 2013-2017 Ziv Barber;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



## Credit:

- For creating zip streams i'm using 'archiver' by cmilhench, dbrockman, paulj originally inspired by Antoine van Wel's zipstream.

## Keywords