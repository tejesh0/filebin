Assumption: 

Handles multiple file uploads from input form, with each file size maxing at 20MB.

Limited 30 files per upload

There is no preview mode for files uploaded. That avoids XSS attacks if user uploads HTML files. If HTML files are to be handled, escape string and display

Better to generate filenames in the backend than storing as same filename. If storring by same filename, secure the filename by sanitizing. Remove '.', '..', so that 'filename.bashrc' cant be stored in root directory which could get executed by server admin.

Because 20mb limit is applied, storing the files in memory rather a temp directory. This would not scale if concurrency of file uploads exceeds such that combined filememory exceeds server RAM.




DB stores Date epoch time in IST timezone

Took file_size as INTEGER because max value is 20MB, if this is upgraded, field type need to be Altered.



[ ] Each time new page is rendered, render with NewURL
[ ] Send newUrl with form submission throug hidden field
[ ] Save newUrl in DB


[ ] Display File Too Large error if file size is greater than 20mb
[ ] Overriding filenames by adding suffix
[ ] Secure filenames using package sanitize-filenames
[ ] Generate Link and status, created_at time, size of file, extension
[ ] In preview link route (actual url), show download option
[ ] When get parameter contains ?download=true, download the file, and set the status as true

