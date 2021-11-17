import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { Linking } from 'react-native';

const App = () => {
  const [state, setstate] = useState({
    list: [],
    page: 0,
    size: 10,
  });

  const [refresh, setRefresh] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = () => {
    setLoadingMore(true);
    const {page, size} = state;
    axios
      .get(
        `https://api.instantwebtools.net/v1/passenger?page=${page}&size=${size}`,
      )
      .then(res => {
        if (!res.data) {
          return;
        }
        setstate({
          list: state.list.concat(res.data.data),
          page: page + 1,
          size,
        });
        setLoadingMore(false);
      });
  };

  const Item = ({title, trip, airline, id}) => (
    <View style={styles.item}>
      <Text style={styles.name}>Name: {title}</Text>
      <Text style={styles.trip}>Trips: {trip}</Text>
      {airline.map(e => 
      <View>
        <Text style={styles.name}>{e.name}</Text>
        <Text style={styles.link} 
          onPress={() => Linking.openURL("https://" + e.website)}>
          {e.website}
        </Text>
        <Image
          style={styles.airlineLogo}
          source={{
            uri: e.logo,
          }}
      />
      </View>  
      )}
      
    </View>
  );

  const ListFooterComponent = () => (
    <Text
      style={styles.loadingTitle}
    >
      Loading...
    </Text>
  );

  const renderItem = useCallback(({item}) => {
    return <Item title={item.name} trip={item.trips} airline={item.airline} id={item._id}/>;
  },[]);

  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const onRefresh = useCallback(() => {
    setRefresh(true);
    wait(1000).then(() => {
      setstate({
        page: 0,
      })
      fetchResult()
      setRefresh(false);
    });
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Passengers</Text>
      <FlatList
        refreshing={refresh}
        onRefresh={onRefresh}
        style={{flex: 1}}
        extraData={state.page}
        onEndReached={fetchResult}
        onEndReachedThreshold={0.2}
        data={state.list}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        ListFooterComponent={() => loadingMore && <ListFooterComponent />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: "#eaeaea",    
  },
  headerTitle: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 16,
  },
  item: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000"
  },
  trip: {
    fontSize: 14,
    color: "#000000"
  },
  airlineLogo: {
    marginTop: 8,
    flex: 1,
    width: "100%",
    height: 100,
    resizeMode: 'contain',
  },
  link: {
    color: "blue",
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 8,
  }
});

export default App;