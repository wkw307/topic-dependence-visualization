#### start

`rscript test.r ../data/nodes.txt ../data/clink.txt`

#### output community

```r
nodes <- read.table(topics)
links <- read.table(dependences)
g <- graph_from_data_frame(d=links,vertices=nodes,directed=F)
e <- multilevel.community(g, weights=NA)
com <- membership(e)
com <- cbind(V(g),e$membership) #V(g) gets the number of vertices
com <- cbind(V(g)$name,e$membership) #To get names if your vertices are labeled
write.table(com, file='mc.txt')
```