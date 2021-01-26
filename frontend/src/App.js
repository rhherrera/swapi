import React, { Component } from "react";
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import axios from "axios";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showFile: false,
      filelist: [],
      values: [],
      keys: [],
      currentKeys: [],
      pagination: {},
      filename: '',
      filters: [],
      fileId: null
    };
    this.refreshList();
  }

  setFileData (data, startAt) {
    let keys = Object.keys(data.data[0]);
    if (this.state.keys) {
      this.setState({keys:keys});
    }
    let values = []
    data.data.map(item => {
      values.push(Object.values(item));
    });
    if (startAt) {
      values = this.state.values.concat(values);
    }
    this.setState({showFile: true, pagination: data.pagination, values: values, currentKeys: keys});
  }
  getDataSet = (fileId, selected, startAt) => {
    let url = 'http://localhost:8000/dataset/' + fileId;
    if (selected) {
      url+='?fields=' + selected.toString();
    }
    if (startAt) {
      if (url.includes("?")){
        url+='&';
      } else {
        url+='?';
      }
      url+='start_at=' + startAt;
    }
    axios
    .get(url)
    .then(res => this.setFileData(res.data, startAt))
  }
  loadMore = () => {
    this.getDataSet(this.state.fileId, this.state.filters, this.state.pagination.next);
  }
  handleFile (filename, e) {
    let fileId = e.currentTarget.dataset.id;
    this.setState({filename: filename, fileId:fileId});
    this.getDataSet(fileId);
  }
  addFilter (selected) {
    this.setState({filters: selected});
    this.getDataSet(this.state.fileId, selected);
  }
  renderRows = () => {
    return this.state.values.map((item, index) => (
      <tr id={index}>
        {item.map((value) => {
              return (
                <td>{value}</td>
              );
            })}
      </tr>
    ));
  };
  renderColumns = () => {
    return this.state.currentKeys.map(rowName => (
      <th scope="col">{rowName}</th>
    ))
  };
  renderTable = () => {
    return (
      <div className="card p-3">
        <h1 id='title'>{this.state.filename}</h1>
        <DropdownMultiselect
          options={this.state.keys}
          name="filters"
          placeholder="Filter by column"
          handleOnChange={(selected) => {
            this.addFilter(selected);
          }}
        />
        <div class="mt-1">
          <table class="table" id='characters'>
            <thead class="thead-dark">
              <tr key={'columns_names'}>
                {this.renderColumns()}
              </tr>
            </thead>
            <tbody>
                {this.renderRows()}
            </tbody>
          </table>
        </div>
        <button className={"btn btn-secondary " + (this.state.pagination.next ? 'visible' : 'invisible')} onClick={this.loadMore}>Load more</button>
      </div>
   )
  };
  renderFiles = () => {
    return this.state.filelist.map(item => (
      <li onClick={this.handleFile.bind(this, item.filename)} data-id={item.id} 
        key={item.id}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        <span
          className={`todo-title mr-2 `}
          title={item.date}
        >
          {item.date}
        </span>
      </li>
    ));
  };
  renderList = () => {
    return (
      <div className="card p-3">
        <div className="">
          <button className="btn btn-success mb-2" onClick={this.handleSubmit}>Fetch</button>
        </div>
        <ul>
          {this.renderFiles()}
        </ul>
      </div>
    );
  }
  renderSection = () => {
    if (this.state.showFile) {
      return this.renderTable()
    } else {
      return this.renderList()
    }
  }
  refreshList = () => {
    axios
      .get("http://localhost:8000/dataset/")
      .then(res => this.setState({ showFile: false, filelist: res.data }))
  }

  getCollections = () => {
    this.setState({ showFile: false});
    this.renderSection()
  }
  handleSubmit = () => {
    axios
      .post("http://localhost:8000/dataset/")
      .then(res => this.refreshList());
  };
  render() {
    return (
      <main className="content">
        <h1 className="text-white text-uppercase text-center my-4">
          <span>Star wars explorer</span>
          <button type="button" class="btn btn-primary pull-right ml-3 mb-2" onClick={this.getCollections}>Collections</button>
        </h1>
        <hr/>
        <div className="row ">
          <div className=" col-sm-10 mx-auto p-0">
              {this.renderSection()}
          </div>
        </div>
      </main>
    );
  }
}
export default App;

