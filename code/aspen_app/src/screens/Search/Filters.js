import { useNavigation, useNavigationState } from '@react-navigation/native';
import _ from 'lodash';
import { Box, Button, Center, ChevronRightIcon, HStack, Pressable, ScrollView, Text, View, VStack } from 'native-base';
import React from 'react';
import { LanguageContext, LibraryBranchContext, LibrarySystemContext, UserContext } from '../../context/initialContext';
import { getTermFromDictionary } from '../../translations/TranslationService';

// custom components and helper files
import { buildParamsForUrl, SEARCH } from '../../util/search';
import { UnsavedChangesExit } from './UnsavedChanges';

export const FiltersScreen = () => {
     const navigation = useNavigation();
     const [loading, setLoading] = React.useState(false);
     const { user } = React.useContext(UserContext);
     const { library } = React.useContext(LibrarySystemContext);
     const { location } = React.useContext(LibraryBranchContext);
     const { language } = React.useContext(LanguageContext);
     const pendingFiltersFromParams = useNavigationState((state) => state.routes[0]['params']['pendingFilters']);

     let facets = SEARCH.availableFacets ? Object.keys(SEARCH.availableFacets) : [];
     let pendingFilters = SEARCH.pendingFilters ?? [];

     if (pendingFilters !== pendingFiltersFromParams) {
          navigation.setOptions({
               headerRight: () => <UnsavedChangesExit language={language} updateSearch={updateSearch} discardChanges={discardChanges} prevRoute="SearchScreen" />,
          });
     }

     const locationGroupedWorkDisplaySettings = location.groupedWorkDisplaySettings ?? [];
     const libraryGroupedWorkDisplaySettings = library.groupedWorkDisplaySettings ?? [];

     const renderFilter = (label, index) => {
          return (
               <Pressable key={index} borderBottomWidth="1" _dark={{ borderColor: 'gray.600' }} borderColor="coolGray.200" py="5" onPress={() => openCluster(label)}>
                    <VStack alignContent="center">
                         <HStack justifyContent="space-between" align="center">
                              <Text bold>{label}</Text>
                              <ChevronRightIcon />
                         </HStack>
                         {appliedFacet(label)}
                    </VStack>
               </Pressable>
          );
     };

     const appliedFacet = (cluster) => {
          const facetData = _.filter(SEARCH.availableFacets, ['label', cluster]);
          const pendingFacets = _.filter(pendingFilters, ['field', facetData[0]['field']]);
          let text = '';

          if (!_.isUndefined(SEARCH.appliedFilters[cluster])) {
               const facet = SEARCH.appliedFilters[cluster];
               _.forEach(facet, function (item, key) {
                    if (text.length === 0) {
                         text = text.concat(_.toString(item['display']));
                    } else {
                         text = text.concat(', ', _.toString(item['display']));
                    }
               });
          }

          let pendingText = '';
          if (!_.isUndefined(pendingFacets[0])) {
               const obj = pendingFacets[0]['facets'];
               _.forEach(obj, function (value, key) {
                    if (value === 'year desc,title asc') {
                         value = getTermFromDictionary(language, 'year_desc_title_asc');
                    } else if (value === 'relevance') {
                         value = getTermFromDictionary(language, 'relevance');
                    } else if (value === 'author asc,title asc') {
                         value = getTermFromDictionary(language, 'author');
                    } else if (value === 'title') {
                         value = getTermFromDictionary(language, 'title');
                    } else if (value === 'days_since_added asc') {
                         value = getTermFromDictionary(language, 'date_purchased_desc');
                    } else if (value === 'callnumber_sort') {
                         value = getTermFromDictionary(language, 'callnumber_sort');
                    } else if (value === 'popularity desc') {
                         value = getTermFromDictionary(language, 'total_checkouts');
                    } else if (value === 'rating desc') {
                         value = getTermFromDictionary(language, 'rating_desc');
                    } else if (value === 'total_holds desc') {
                         value = getTermFromDictionary(language, 'total_holds_desc');
                    } else if (value === 'global') {
                         if (locationGroupedWorkDisplaySettings.superScopeLabel || _.isEmpty(locationGroupedWorkDisplaySettings.superScopeLabel)) {
                              value = locationGroupedWorkDisplaySettings.superScopeLabel;
                         } else if (libraryGroupedWorkDisplaySettings.superScopeLabel || _.isEmpty(libraryGroupedWorkDisplaySettings.superScopeLabel)) {
                              value = libraryGroupedWorkDisplaySettings.superScopeLabel;
                         }
                    } else if (value === 'local') {
                         if (locationGroupedWorkDisplaySettings.localLabel || _.isEmpty(locationGroupedWorkDisplaySettings.localLabel)) {
                              value = locationGroupedWorkDisplaySettings.localLabel;
                         } else if (libraryGroupedWorkDisplaySettings.localLabel || _.isEmpty(libraryGroupedWorkDisplaySettings.localLabel)) {
                              value = libraryGroupedWorkDisplaySettings.localLabel;
                         }
                    } else if (value === 'available') {
                         if (locationGroupedWorkDisplaySettings.availableLabel || _.isEmpty(locationGroupedWorkDisplaySettings.availableLabel)) {
                              value = locationGroupedWorkDisplaySettings.availableLabel;
                         } else if (libraryGroupedWorkDisplaySettings.availableLabel || _.isEmpty(libraryGroupedWorkDisplaySettings.availableLabel)) {
                              value = libraryGroupedWorkDisplaySettings.availableLabel;
                         }
                    } else if (value === 'available_online') {
                         if (locationGroupedWorkDisplaySettings.availableOnlineLabel || _.isEmpty(locationGroupedWorkDisplaySettings.availableOnlineLabel)) {
                              value = locationGroupedWorkDisplaySettings.availableOnlineLabel;
                         } else if (libraryGroupedWorkDisplaySettings.availableOnlineLabel || _.isEmpty(libraryGroupedWorkDisplaySettings.availableOnlineLabel)) {
                              value = libraryGroupedWorkDisplaySettings.availableOnlineLabel;
                         }
                    } else {
                         // do nothing
                    }
                    if (pendingText.length === 0) {
                         pendingText = pendingText.concat(_.toString(value));
                    } else {
                         pendingText = pendingText.concat(', ', _.toString(value));
                    }
               });
          }

          if (!_.isEmpty(text) || !_.isEmpty(pendingText)) {
               if (!_.isEmpty(pendingText) && _.isEmpty(text)) {
                    return <Text italic>{pendingText}</Text>;
               } else if (!_.isEmpty(pendingText) && !_.isEmpty(text)) {
                    return <Text italic>{pendingText}</Text>;
               } else {
                    return <Text>{text}</Text>;
               }
          } else {
               return null;
          }
     };

     const actionButtons = () => {
          return (
               <Box safeArea={3} _light={{ bg: 'coolGray.50' }} _dark={{ bg: 'coolGray.700' }} shadow={1}>
                    <Center>
                         <Button.Group size="lg">
                              <Button variant="unstyled" onPress={() => clearSelections()}>
                                   {getTermFromDictionary(language, 'reset_all')}
                              </Button>
                              <Button
                                   isLoading={loading}
                                   isLoadingText={getTermFromDictionary(language, 'updating', true)}
                                   onPress={() => {
                                        setLoading(true);
                                        updateSearch();
                                   }}>
                                   {getTermFromDictionary(language, 'update')}
                              </Button>
                         </Button.Group>
                    </Center>
               </Box>
          );
     };

     const openCluster = (cluster) => {
          const obj = SEARCH.availableFacets[cluster];
          navigation.navigate('Facet', {
               data: cluster,
               defaultValues: [],
               title: obj['label'],
               key: obj['value'],
               term: '',
               facets: obj.facets,
               pendingUpdates: [],
               extra: obj,
          });
     };

     const updateSearch = () => {
          const params = buildParamsForUrl();
          SEARCH.hasPendingChanges = false;
          navigation.navigate('BrowseTab', {
               screen: 'SearchResults',
               params: {
                    term: SEARCH.term,
                    pendingParams: params,
               },
          });
     };

     const discardChanges = () => {
          SEARCH.hasPendingChanges = false;
          SEARCH.appliedFilters = [];
          SEARCH.sortMethod = 'relevance';
          SEARCH.availableFacets = [];
          SEARCH.pendingFilters = [];
          SEARCH.appendedParams = '';

          navigation.navigate('BrowseTab', {
               screen: 'SearchResults',
               params: {
                    term: SEARCH.term,
                    pendingParams: '',
               },
          });
     };

     const clearSelections = () => {
          SEARCH.hasPendingChanges = false;
          SEARCH.appliedFilters = [];
          SEARCH.sortMethod = 'relevance';
          SEARCH.availableFacets = [];
          SEARCH.pendingFilters = [];
          SEARCH.appendedParams = '';

          navigation.navigate('BrowseTab', {
               screen: 'SearchResults',
               params: {
                    term: SEARCH.term,
                    pendingParams: '',
               },
          });
     };

     return (
          <View style={{ flex: 1 }}>
               <ScrollView>
                    <Box safeArea={5}>{facets.map((item, index, array) => renderFilter(item, index))}</Box>
               </ScrollView>
               {actionButtons()}
          </View>
     );
};