Please note that, at the moment, this tries to run on 16 cores. Still, it will
probably work okay even if you only have 2. Pity the poor soul who has 1.

You run it:

    > hoo src out

It expects a template .haml file named "template.haml" (you can choose a different
file as a command line option). It will look for a resources directory called "resources"
(but again, this is customizable, and it will ignore it if it is not found).

Output, obviously, goes into the output directory. The source directory will be
recursively scanned for files ending with .md.