import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import { ChevronLeftIcon, CloseIcon, Pressable } from 'native-base';
import React from 'react';
import { enableScreens } from 'react-native-screens';

import { GroupedWork221200, GroupedWorkScreen } from '../../screens/GroupedWork/GroupedWork';
import Facet from '../../screens/Search/Facet';
import { FiltersScreen } from '../../screens/Search/Filters';
import { LanguageContext } from '../../context/initialContext';
import { SearchHome } from '../../screens/Search/Search';
import { SearchResults } from '../../screens/Search/SearchResults';
import { WhereIsIt } from '../../screens/GroupedWork/WhereIsIt';
import { EditionsModal } from './BrowseStackNavigator';
import { CreateVDXRequest } from '../../screens/GroupedWork/CreateVDXRequest';
import { getTermFromDictionary } from '../../translations/TranslationService';

enableScreens();

const SearchStackNavigator = ({ options, route, back, navigation }) => {
     const { language } = React.useContext(LanguageContext);
     const Stack = createStackNavigator();
     return (
          <Stack.Navigator
               id="SearchNavigator"
               initialRouteName="SearchScreen"
               screenOptions={({ navigation, route }) => ({
                    headerShown: true,
                    headerBackTitleVisible: false,
               })}>
               <Stack.Group>
                    <Stack.Screen
                         name="SearchScreen"
                         component={SearchHome}
                         options={{
                              title: getTermFromDictionary(language, 'search'),
                         }}
                    />
                    <Stack.Screen
                         name="ResultItem"
                         component={GroupedWorkScreen}
                         options={({ route }) => ({
                              title: route.params.title ?? getTermFromDictionary(language, 'item_details'),
                         })}
                         initialParams={{ prevRoute: 'SearchResults' }}
                    />
                    <Stack.Screen
                         name="ResultItem221200"
                         component={GroupedWork221200}
                         options={({ route }) => ({
                              title: route.params.title ?? getTermFromDictionary(language, 'item_details'),
                         })}
                    />
               </Stack.Group>

               <Stack.Screen
                    name="CopyDetails"
                    component={WhereIsIt}
                    options={({ navigation }) => ({
                         title: getTermFromDictionary(language, 'where_is_it'),
                         headerShown: true,
                         presentation: 'modal',
                         headerLeft: () => {
                              return null;
                         },
                         headerRight: () => (
                              <Pressable onPress={() => navigation.goBack()} mr={3} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                                   <CloseIcon size={5} color="primary.baseContrast" />
                              </Pressable>
                         ),
                    })}
               />
               <Stack.Screen
                    name="EditionsModal"
                    component={EditionsModal}
                    options={{
                         headerShown: false,
                         presentation: 'modal',
                    }}
               />
               <Stack.Screen
                    name="modal"
                    component={FilterModal}
                    options={{
                         headerShown: false,
                         presentation: 'modal',
                    }}
               />
               <Stack.Screen
                    name="CreateVDXRequest"
                    component={CreateVDXRequest}
                    options={({ navigation }) => ({
                         title: getTermFromDictionary(language, 'ill_request_title'),
                         presentation: 'modal',
                         headerLeft: () => {
                              return <></>;
                         },
                         headerRight: () => (
                              <Pressable onPress={() => navigation.goBack()} mr={3} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                                   <CloseIcon size={5} color="primary.baseContrast" />
                              </Pressable>
                         ),
                    })}
               />
          </Stack.Navigator>
     );
};

const FilterModalStack = createNativeStackNavigator();
const FilterModal = () => {
     const { language } = React.useContext(LanguageContext);
     return (
          <FilterModalStack.Navigator
               id="SearchFilters"
               screenOptions={({ navigation, route }) => ({
                    headerShown: false,
                    animationTypeForReplace: 'push',
                    gestureEnabled: false,
                    headerLeft: () => {
                         if (route.name !== 'Filters') {
                              return (
                                   <Pressable onPress={() => navigation.goBack()} mr={3} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                                        <ChevronLeftIcon size={5} color="primary.baseContrast" />
                                   </Pressable>
                              );
                         } else {
                              return null;
                         }
                    },
                    headerRight: () => (
                         <Pressable onPress={() => navigation.getParent().pop()} mr={3} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                              <CloseIcon size={5} color="primary.baseContrast" />
                         </Pressable>
                    ),
               })}>
               <FilterModalStack.Screen
                    name="Filters"
                    component={FiltersScreen}
                    options={{
                         title: getTermFromDictionary(language, 'filters'),
                         headerShown: true,
                         presentation: 'card',
                    }}
               />
               <FilterModalStack.Screen
                    name="Facet"
                    component={Facet}
                    options={({ route }) => ({
                         title: route.params.title,
                         headerShown: true,
                         presentation: 'card',
                    })}
               />
          </FilterModalStack.Navigator>
     );
};

export default SearchStackNavigator;