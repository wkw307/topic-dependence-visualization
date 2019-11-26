#!/usr/local/bin/Rscript

suppressPackageStartupMessages(library(igraph))

topics <- unlist(input[1])
dependences <- unlist(input[2])
output <- unlist(input[3])
nodes <- read.table(topics)
links <- read.table(dependences)
directedG <- graph_from_data_frame(d=links,vertices=nodes,directed=T)
g <- graph_from_data_frame(d=links,vertices=nodes,directed=F)
# plot(lc,g1, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('LC',modularity(lc)))

#• Community structure in social and biological networks
# M. Girvan and M. E. J. Newman
# edge.betweenness.community
ec <- edge.betweenness.community(g)
ec_modularity <- modularity(ec)
ec_com <- membership(ec)
ec_com <- cbind(V(g),ec$membership) #V(g) gets the number of vertices
ec_com <- cbind(V(g)$name,ec$membership) #To get names if your vertices are labeled
write.table(ec_com, file=paste(output, 'ec.txt', sep=''))
print(paste('ec:', ec_modularity))
jpeg(paste(output, 'EC.jpg', sep=''))
plot(ec,directedG, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('EC',modularity(ec)))
dev.off()
#• Computing communities in large networks using random walks
# Pascal Pons, Matthieu Latapy
wc <- walktrap.community(g)
wc_modularity <- modularity(wc)
wc_com <- membership(wc)
wc_com <- cbind(V(g),wc$membership) #V(g) gets the number of vertices
wc_com <- cbind(V(g)$name,wc$membership) #To get names if your vertices are labeled
write.table(wc_com, file=paste(output, 'wc.txt', sep=''))
print(paste('wc:', wc_modularity))
jpeg(paste(output, 'WC.jpg', sep=''))
plot(wc,directedG, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('WC',modularity(wc)))
dev.off()
#• Finding community structure in networks using the eigenvectors of matrices
# MEJ Newman
lec <-leading.eigenvector.community(g)
lec_modularity <- modularity(lec)
lec_com <- membership(lec)
lec_com <- cbind(V(g),lec$membership) #V(g) gets the number of vertices
lec_com <- cbind(V(g)$name,lec$membership) #To get names if your vertices are labeled
write.table(lec_com, file=paste(output, 'lec.txt', sep=''))
print(paste('lec:',lec_modularity))
jpeg(paste(output, 'LEC.jpg', sep=''))
plot(lec,directedG, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('LEC',modularity(lec)))
dev.off()
#• Finding community structure in very large networks
# Aaron Clauset, M. E. J. Newman, Cristopher Moore
#• Finding Community Structure in Mega-scale Social Networks
# Ken Wakita, Toshiyuki Tsurumi
fc <- fastgreedy.community(g)
fc_modularity <- modularity(fc)
fc_com <- membership(fc)
fc_com <- cbind(V(g),fc$membership) #V(g) gets the number of vertices
fc_com <- cbind(V(g)$name,fc$membership) #To get names if your vertices are labeled
write.table(fc_com, file=paste(output, 'fc.txt', sep=''))
print(paste('fc:', fc_modularity))
jpeg(paste(output, 'FC.jpg', sep=''))
plot(fc,directedG, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('FC',modularity(fc)))
dev.off()
#• Fast unfolding of communities in large networks
# Vincent D. Blondel, Jean-Loup Guillaume, Renaud Lambiotte, Etienne Lefebvre
mc <- multilevel.community(g, weights=NA)
mc_modularity <- modularity(mc)
mc_com <- membership(mc)
mc_com <- cbind(V(g),mc$membership) #V(g) gets the number of vertices
mc_com <- cbind(V(g)$name,mc$membership) #To get names if your vertices are labeled
write.table(mc_com, file=paste(output, 'mc.txt', sep=''))
print(paste('mc:',mc_modularity))
jpeg(paste(output, 'MC.jpg', sep=''))
plot(mc,directedG, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('MC',modularity(mc)))
dev.off()
#• Near linear time algorithm to detect community structures in large-scale networks.
# Raghavan, U.N. and Albert, R. and Kumara, S.
# Phys Rev E 76, 036106. (2007)
lc <- label.propagation.community(g)
lc_modularity <- modularity(lc)
lc_com <- membership(lc)
lc_com <- cbind(V(g),lc$membership) #V(g) gets the number of vertices
lc_com <- cbind(V(g)$name,lc$membership) #To get names if your vertices are labeled
write.table(lc_com, file=paste(output, 'lc.txt', sep=''))
print(paste('lc:', lc_modularity))
jpeg(paste(output, 'LC.jpg', sep=''))
plot(lc,directedG, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('LC',modularity(lc)))
dev.off()
arr <- c(ec_modularity, wc_modularity, lec_modularity, fc_modularity, mc_modularity, lc_modularity)
arrName <- c('ec', 'wc', 'lec', 'fc', 'mc', 'lc')
arrCom <- list(list(ec_com), list(wc_com), list(lec_com), list(fc_com), list(mc_com), list(lc_com))
paste(arrName[which.max(arr)], max(arr), ' ')
