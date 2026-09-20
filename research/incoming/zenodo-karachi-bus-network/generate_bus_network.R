# ****************************
# Author: Muhammad Qasim Pasta
# Description: Generating network through edge list
# ****************************

require(tidyverse)
require(igraph)

# loading edge list and creating graph
edges = read.csv("karachi_bus_network_edge_list.csv")
bus_network = graph_from_data_frame(edges)


# loading node data for long/lati
nodes_data = read_csv("karachi_bus_network_node_data.csv")
nodes = V(bus_network)$name # node names

# storing longi/lati values as per the order they appear in the graph
longi_values = nodes_data$long[match(nodes, nodes_data$node)]
lati_values = nodes_data$latit[match(nodes, nodes_data$node)]
V(bus_network)$longi = longi_values
V(bus_network)$lati = lati_values

# merge multiple edges (routes) into one edge
# and merge bus names into a list for each edge
bus_network = igraph::simplify(bus_network, edge.attr.comb = "concat")

write_graph(bus_network, file = "karachi_bus_network.graphml",format="graphml")
