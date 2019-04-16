#!/usr/local/bin/Rscript

suppressPackageStartupMessages(library(igraph))
args <- commandArgs(TRUE)
topics <- args[1]
dependences <- args[2]
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
print(paste('ec:', ec_modularity))
jpeg('./tmp/EC.jpg')
plot(ec,directedG, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('EC',modularity(ec)))
dev.off()
#• Computing communities in large networks using random walks
# Pascal Pons, Matthieu Latapy
wc <- walktrap.community(g)
wc_modularity <- modularity(wc)
print(paste('wc:', wc_modularity))
jpeg('./tmp/WC.jpg')
plot(wc,directedG, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('WC',modularity(wc)))
dev.off()
#• Finding community structure in networks using the eigenvectors of matrices
# MEJ Newman
lec <-leading.eigenvector.community(g)
lec_modularity <- modularity(lec)
print(paste('lec:',lec_modularity))
jpeg('./tmp/LEC.jpg')
plot(lec,directedG, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('LEC',modularity(lec)))
dev.off()
#• Finding community structure in very large networks
# Aaron Clauset, M. E. J. Newman, Cristopher Moore
#• Finding Community Structure in Mega-scale Social Networks
# Ken Wakita, Toshiyuki Tsurumi
fc <- fastgreedy.community(g)
fc_modularity <- modularity(fc)
print(paste('fc:', fc_modularity))
jpeg('./tmp/FC.jpg')
plot(fc,directedG, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('FC',modularity(fc)))
dev.off()
#• Fast unfolding of communities in large networks
# Vincent D. Blondel, Jean-Loup Guillaume, Renaud Lambiotte, Etienne Lefebvre
mc <- multilevel.community(g, weights=NA)
mc_modularity <- modularity(mc)
print(paste('mc:',mc_modularity))
jpeg('./tmp/MC.jpg')
plot(mc,directedG, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('MC',modularity(mc)))
dev.off()
#• Near linear time algorithm to detect community structures in large-scale networks.
# Raghavan, U.N. and Albert, R. and Kumara, S.
# Phys Rev E 76, 036106. (2007)
lc <- label.propagation.community(g)
lc_modularity <- modularity(lc)
print(paste('lc:', lc_modularity))
jpeg('./tmp/LC.jpg')
plot(lc,directedG, layout=layout.auto, vertex.size=5,vertex.label=NA,edge.arrow.size=0.5,main=paste('LC',modularity(lc)))
dev.off()