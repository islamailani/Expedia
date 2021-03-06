import * as React from "react";
import * as ReactDOM from "react-dom";
import ContactFecthHelper,{ContactModel,ContactDetailModel} from "../services/contactFetch";
import SearchBar from "./SearchBar";
import {Link, NavLink } from "react-router-dom";
import PageBar from "./PageBar";
import { Route } from 'react-router-dom';
import ErrorPopupHandler from "./ErrorPopupHandler";
interface LineProps {
    item:any
}
class Line extends React.Component<LineProps,{}> {
    constructor(props:any) {
        super(props);
    }
    render() {
        //console.log(JSON.stringify(this.props));
        return (
            <tr>
                <td scope="row"><Link to={'/contactDetails/{userId}'.replace('{userId}',this.props.item.UserId)}>{this.props.item.UserId}</Link></td>
                <td>{this.props.item.Title}</td>
                <td>{this.props.item.Name}</td>
                <td>{this.props.item.BirthDate}</td>
                <td>{this.props.item.Age}</td>
                <td>{this.props.item.ContactCount}</td>
                <td>{this.props.item.IsFavorite==1?'YES':'NO'}</td>
            </tr>
        );
    }
}

interface cpageItemsProps {
    cpageItems:any[],
}
export class TableBody extends React.Component<cpageItemsProps,{}> {
    constructor(props:any) {
        super(props);
    }
    render() {
        return this.props.cpageItems.map((titem:ContactModel)=>{
            return <Line item ={titem} key={titem.UserId}></Line>
         })
    }
}
export interface ExpediaProps {
    items: any[]
}
export interface ExpediaState {
    defaultPageSize: number,
    items: ContactModel[],
    cpageItems: ContactModel[], // current page items //tmpitems
    cindex: number, //current page index
    searchVal:string,
    Name:string,
    hasError: boolean, //Has Error?
    msg: string, //the error msg,
    msg_diss:boolean, //close msg,
    loading: boolean //data loading..
}
export default class Expedia extends React.Component<ExpediaProps,ExpediaState> {
    constructor(props:any) {
        super(props);
        this.state={
            defaultPageSize:10,
            items:[],
            cindex: 1,
            cpageItems:[],
            searchVal:null,
            Name:null,
            hasError: false,
            msg: null,
            msg_diss:false,
            loading:false
        }
        this.fetchContactsByUserName =this.fetchContactsByUserName.bind(this);
    }
    
    componentWillMount() {
        this.fetchContactsByUserName();
    }
    componentDidMount() {
       console.log('componentDidMount');
    }
  
    fetchContactsByUserName(userName?:string):void {
       //fetch the data from backend
       console.log('api fetch....');
        this.setState({loading:true});
       if(!userName && !this.state && this.state.Name) {
           this.setState({loading:false});
           return ;
       }
       ContactFecthHelper.fetchContactByUserName(userName|| this.state && this.state.Name)
       .then((result:ContactModel[])=>{
          //console.log('result....');
          //console.log('result:'+JSON.stringify(result));
          this.setState({items: result,loading:false});
          this.paging(1);
       })
       .catch((error)=>{
            //console.log(error);
            this.setState({hasError:true,msg:error.message});
       });
    }
    /**
     * paging here
     * @param cindex current page index
     */
    paging(cindex:number) {
      let totalPage=  this.state.items.length /this.state.defaultPageSize;
       if(cindex<totalPage) {
           this.setState({cpageItems: this.state.items.slice((cindex-1)*this.state.defaultPageSize,cindex*this.state.defaultPageSize-1),cindex: cindex});
           cindex++;
       }else {
           //if the current data is bigger than the existed data in client, pull data from the server side
       }
    }
    getCpageIndex():number {
       return this.state.cindex;
    }
    setCpageIndex(cindex:number) {
        this.setState({cindex:cindex});
    }
    /**
     * bind the callback listener for page item click
     * when item clicked ,rerender the data items
     * @param e 
     */
    pageItemClickCallback(e:any) {
        //console.log('item:'+e.target.innerText);
        let tmp =e.target.innerText;
        let cindex =parseInt(tmp);
        //console.log('cindex:'+cindex);
        this.paging(cindex);
    }
    pNextItemClickCallback(e:any) {
        let cindex =this.state.cindex;
        this.paging(cindex+1);
    }
    pPreviouseClickCallback(e:any) {
        let cindex =this.state.cindex;
        this.paging(cindex-1);
    }
    buildQuery():string[] {
        return null;
    }
    //connect to the changeEvent of input
    typeFuc(value:any) {
       let val =value;
       this.setState({Name:val,searchVal:val});
       setTimeout(this.fetchContactsByUserName,1000,val);
       //this.fetchContactsByUserName(val);
       console.log(val);
    }
    sortBy(e:any) {
        console.log('sortby:'+JSON.stringify(e.target.innerText));
        let sortField =e.target.innerText;
        //update the items by given sort
        let currentCpageItems = this.state.cpageItems;
        currentCpageItems.sort((a,b)=>{
            if(sortField=='Name') {
                if(a.Name >b.Name) {
                    return 1;
                }else if(a.Name < b.Name){
                    return -1;
                }else {
                    return 0;
                }
            }
            if(sortField=='Title') {
                if(a.Title >b.Title) {
                    return 1;
                }else if(a.Title < b.Title){
                    return -1;
                }else {
                    return 0;
                }
            }
            if(sortField=='BirthDate') {
                if(a.BirthDate >b.BirthDate) {
                    return 1;
                }else if(a.BirthDate < b.BirthDate){
                    return -1;
                }else {
                    return 0;
                }
            }
            if(sortField=='Age') {
                return a.Age-b.Age;
            }
            if(sortField=='ContactCount') {
               return a.ContactCount -b.ContactCount;
            }
        });
        this.setState({cpageItems:currentCpageItems})
    }
    msgCloseCallback(e:any) {
        this.setState({msg_diss: true});
    }
    renderItems =()=>{return this.state.cpageItems.map((titem:ContactModel)=>{
        return <Line item={titem}></Line>
     })};
     renderHeader =()=>{
         let headers =[
         {colName:'UserId',sortBy: this.sortBy.bind(this)},
         {colName:'Title',sortBy:this.sortBy.bind(this)},
         {colName:'Name',sortBy:this.sortBy.bind(this)},
         {colName:'BirthDate',sortBy:this.sortBy.bind(this)},
         {colName:'Age',sortBy:this.sortBy.bind(this)},
         {colName:'ContactCount',sortBy:this.sortBy.bind(this)},
         {colName:'IsFavorite',sortBy:this.sortBy.bind(this)}
        ];
     let headerWrap=   headers.map((item,index:number)=>{
            if(item.sortBy) {
                return <th key={index} scope="col" className="table-th">
                    <span onClick={(e)=>{
                        item.sortBy(e);
                    }}>{item.colName}</span>
                </th>
            }else {
                return <th key={index} scope="col" className="table-th">{item.colName}</th>
            }
            
        });
        return headerWrap;
     };
    render() {
        return(<div>
            <ErrorPopupHandler prop={{erro: this.state.hasError,msg:this.state.msg,msgCloseCallback: this.msgCloseCallback.bind(this),msg_diss:this.state.msg_diss}}/>
            <SearchBar changCallback={this.typeFuc.bind(this)}/>
            <table className="table table-sm table-hover">
                <thead className="thead-light">
                    <tr>
                      {this.renderHeader()}
                    </tr>
                </thead>
                <tbody>
                 <TableBody cpageItems={this.state.cpageItems}/>
                </tbody>
            </table>
        <PageBar 
            pageItemClickCallback={this.pageItemClickCallback.bind(this)} 
            pNextItemClickCallback={this.pNextItemClickCallback.bind(this)} 
            pPreviouseClickCallback={this.pPreviouseClickCallback.bind(this)}
            searchVal ={this.state.searchVal}
        />
        </div>);
    }
}