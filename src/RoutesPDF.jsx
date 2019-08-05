import React from 'react';
import {Component} from 'react';
import {Document, Page, Text, View, StyleSheet, PDFViewer} from "@react-pdf/renderer";
  
export default class RoutesPDF extends Component{


    constructor(props){
        super(props);
        this.state={
            data: this.props.pageData,
        };
    }

    render(){
        const styles = StyleSheet.create({
            page: {
              flexDirection: "row"
            },
            section: {
              flexGrow: 1
            }
          });
          
          const MyDocument = (
            <Document>
              <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                  <Text>Hello World!</Text>
                </View>
                <View style={styles.section}>
                  {this.state.data}
                </View>
              </Page>
            </Document>
          );

          return(
              <PDFViewer>{MyDocument}</PDFViewer>
          );
    }

}


  