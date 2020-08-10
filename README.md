## Running the app:

```
git clone https://github.com/tejesh0/filebin.git
cd filebin
npm install
node fileserver.js
```

## Assumptions & Considerations: 

Limited 30 files per upload

If file with same name is uploaded again, instead of overwriting the file, the latest file is stored by adding unique suffix to it.

Better to generate filenames in the backend than storing as same filename. If storring by same filename, secure the filename by sanitizing. Remove '.', '..', so that 'filename.bashrc' cant be stored in root directory which could get executed by server admin.

There is no preview mode for files uploaded. That avoids XSS attacks if user uploads HTML files. If HTML files are to be handled, escape string and display

Because 20mb limit is applied, storing the files in memory rather a temp directory. This would not scale if concurrency of file uploads exceeds such that combined filememory exceeds server RAM.

DB stores Date epoch time in IST timezone

Took file_size as INTEGER because max value is 20MB, if this is upgraded, field type need to be Altered.

### Todo tasks / Workflow:

- [x] Each time new page is rendered, render the Form with hidden filed containing the shareUrl
- [x] Save shareUrl and information of files uploaded to DB
- [x] Display File Too Large error if file size is greater than 20mb
- [x] Overriding filenames by adding suffix
- [x] Secure filenames using package sanitize-filenames
- [x] Generate Link and status, created_at time, size of file, extension
- [x] In preview link route (actual url), show download option
- [x] When get parameter contains ?download=true, download the file, and set the status as true
