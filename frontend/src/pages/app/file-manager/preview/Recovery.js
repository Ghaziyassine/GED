import React, { useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Link } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import keycloak from "../../../auth/keycloak";
import fetchRecoveryList from "../recoveryDB";
import {
  Button,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  RSelect,
} from "../../../../components/Component";
import { selectOptions } from "../Data";
import { FileManagerContext } from "../FileManagerContext";

const Recovery = ({
  searchText,
  setSearchText,
  toggleCreateModal,
  toggleUploadModal,
  toggleScreenLg,
}) => {
  const [dataList, setDataList] = useState([]);
  const [search, setSearch] = useState(false);
  const [filterOptions, setFilterOptions] = useState(false);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const [dates, setDates] = useState({
    from: new Date(),
    to: new Date(),
  });

  const { restoreFolder, permanentDelete, getTotalSize } = useContext(FileManagerContext);
  const { keycloak, initialized } = useKeycloak();

 useEffect(() => {
  let isMounted = true; // flag to track if component is mounted

  // Fetch the list of files with recovery = true
  fetchRecoveryList({ token: keycloak.token })
    .then((recoveredFiles) => {
      if (isMounted) { // Only update state if component is still mounted
        setDataList(recoveredFiles);
      }
    })
    .catch((error) => {
      console.error("Failed to fetch recovery files:", error);
    });

  // Cleanup function to set isMounted to false when component unmounts
  return () => {
    isMounted = false;
  };
}, [initialized, keycloak.token,dataList]); // Include keycloak.token in dependencies if it's changing


  // Sets the filter to default
  const resetFilter = () => {
    setDates({ from: new Date(), to: new Date() });
  };

  // Runs the filter function
  const filterOnDates = () => {
    // Commented out as requested
    /*
    let defaultData = data;
    let dateDay = new Date().getDate();
    if (dates.to.getDate() === dateDay && dates.from.getDate() === dateDay) {
      defaultData = defaultData.filter((item) => item.recovery && item.recovery.deletedAt === "Today");
      setDataList([...defaultData]);
    } else if (dates.to.getDate() !== dateDay) {
      defaultData = defaultData.filter((item) => item.recovery && item.recovery.deletedAt !== "Today");
      setDataList([...defaultData]);
    } else {
      setDataList([...data]);
    }
    */
  };

  const toggleSearch = () => {
    setSearch(!search);
  };

  const toggleFilterOptions = () => {
    setFilterOptions(!filterOptions);
  };

  return (
    <React.Fragment>
      <BlockHead size="sm">
        <BlockBetween className="position-relative">
          <BlockHeadContent>
            <BlockTitle page>Recovery</BlockTitle>
          </BlockHeadContent>
          <BlockHeadContent>
            <ul className="nk-block-tools g-1">
              <li className="d-lg-none">
                <a
                  href="#folder"
                  onClick={(ev) => {
                    ev.preventDefault();
                    toggleSearch();
                  }}
                  className="btn btn-trigger btn-icon search-toggle toggle-search"
                >
                  <Icon name="search"></Icon>
                </a>
              </li>
              <li className="d-lg-none">
                <a
                  href="#folder"
                  onClick={(ev) => {
                    ev.preventDefault();
                    toggleFilterOptions();
                  }}
                  className="btn btn-trigger btn-icon toggle-expand"
                >
                  <Icon name="opt"></Icon>
                </a>
              </li>
              <li className="d-lg-none">
                <UncontrolledDropdown>
                  <DropdownToggle
                    tag="a"
                    href="#toggle"
                    onClick={(ev) => ev.preventDefault()}
                    className="btn btn-trigger btn-icon"
                  >
                    <Icon name="plus"></Icon>
                  </DropdownToggle>
                  <DropdownMenu right>
                    <ul className="link-list-opt no-bdr">
                      <li>
                        <DropdownItem
                          tag="a"
                          href="#upload"
                          onClick={(ev) => {
                            ev.preventDefault();
                            toggleUploadModal();
                          }}
                        >
                          <Icon name="upload-cloud"></Icon>
                          <span>Upload File</span>
                        </DropdownItem>
                      </li>
                      <li>
                        <DropdownItem
                          tag="a"
                          href="#upload"
                          onClick={(ev) => {
                            ev.preventDefault();
                            toggleCreateModal();
                          }}
                        >
                          <Icon name="folder-plus"></Icon>
                          <span>Create Folder</span>
                        </DropdownItem>
                      </li>
                    </ul>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </li>
              <li className="d-lg-none mr-n1">
                <a
                  href="#folder"
                  onClick={(ev) => {
                    ev.preventDefault();
                    toggleScreenLg();
                  }}
                  className="btn btn-trigger btn-icon toggle"
                >
                  <Icon name="menu-alt-r"></Icon>
                </a>
              </li>
            </ul>
          </BlockHeadContent>
          <div className={`search-wrap px-2 d-lg-none ${search ? "active" : ""}`}>
            <div className="search-content">
              <a
                href="#toggle"
                onClick={(ev) => {
                  ev.preventDefault();
                  toggleSearch();
                }}
                className="search-back btn btn-icon toggle-search"
              >
                <Icon name="arrow-left"></Icon>
              </a>
              <input
                type="text"
                className="form-control border-transparent form-focus-none"
                placeholder="Search by user or message"
                value={searchText}
                onChange={(ev) => setSearchText(ev.target.value)}
              />
              <button className="search-submit btn btn-icon">
                <Icon name="search"></Icon>
              </button>
            </div>
          </div>
        </BlockBetween>
      </BlockHead>

      <Block className="nk-fmg-listing">
        {dataList && dataList.length > 0 ? (
          <Row>
            {/* <Col xl="3" className="order-xl-12">
              <div className={`nk-fmg-filter toggle-expand-content ${filterOptions ? "expanded" : ""}`}>
                <form>
                  <Row>
                    <Col lg="12" md="4">
                      <FormGroup>
                        <label className="form-label">From</label>
                        <div className="form-control-wrap">
                          <DatePicker
                            selected={dates.from}
                            onChange={(date) => setDates({ ...dates, from: date })}
                            className="form-control date-picker"
                          />
                        </div>
                      </FormGroup>
                    </Col>
                    <Col lg="12" md="4">
                      <FormGroup>
                        <label className="form-label">To</label>
                        <div className="form-control-wrap">
                          <DatePicker
                            selected={dates.to}
                            onChange={(date) => setDates({ ...dates, to: date })}
                            className="form-control date-picker"
                          />
                        </div>
                      </FormGroup>
                    </Col>
                    <Col lg="12" md="4">
                      <FormGroup>
                        <label className="form-label">Deleted By</label>
                        <div className="form-control-wrap">
                          <RSelect options={selectOptions} />
                        </div>
                      </FormGroup>
                    </Col>
                    <Col lg="12">
                      <div className="d-flex justify-between mt-1">
                        <button type="reset" className="link link-sm link-primary ml-n1" onClick={() => resetFilter()}>
                          Reset Filter
                        </button>
                        <Button color="primary" size="sm" onClick={() => filterOnDates()}>
                          Filter
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </form>
              </div>
            </Col> */}
            <Col xl="9" lg="12">
              <div className="nk-files nk-files-view-list">
                <div className="nk-files-head">
                  <div className="nk-file-item">
                    <div className="nk-file-info">
                      <div className="tb-head">Name</div>
                    </div>
                    <div className="nk-file-meta">
                      <div className="tb-head">Size</div>
                    </div>
                  </div>
                </div>
                <div className="nk-files-list">
                  {dataList
                    .filter((el) => el.meta.recovery)
                    .map((item) => (
                      <div className="nk-file-item nk-file" key={item.id}>
                        <div className="nk-file-info">
                          <a href="#link" onClick={(ev) => ev.preventDefault()} className="nk-file-link">
                            <div className="nk-file-title">
                              <div className="nk-file-icon">
                                <span className="nk-file-icon-type">
                                  <Icon name="file" />
                                </span>
                              </div>
                              <div className="nk-file-name">
                                <div className="nk-file-name-text">
                                  <span className="title">{item.meta.name}</span>
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>
                        <div className="nk-file-meta">
                          <span className="nk-file-size">{item.meta.size} MB</span>
                        </div>
                        <div className="nk-file-actions">
                          <a
                            href="#link"
                            className="btn btn-sm btn-icon btn-trigger"
                            onClick={(ev) => {
                              ev.preventDefault();
                              restoreFolder(item.id);
                            }}
                          >
                            <Icon name="undo"></Icon>
                          </a>
                          <a
                            href="#link"
                            className="btn btn-sm btn-icon btn-trigger"
                            onClick={(ev) => {
                              ev.preventDefault();
                              setFileToDelete(item.id);
                              setConfirmationModalOpen(true);
                            }}
                          >
                            <Icon name="trash"></Icon>
                          </a>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Col>
          </Row>
        ) : (
          <Block className="nk-block text-center">
            <div className="nk-block-content">
              <div className="nk-file-icon">
                <span className="nk-file-icon-type">
                  <Icon name="file" />
                </span>
              </div>
              <div className="nk-block-title">No Files Found</div>
              <div className="nk-block-des">
                <p>Looks like you have no files in recovery mode.</p>
              </div>
            </div>
          </Block>
        )}
      </Block>
      {isConfirmationModalOpen && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Deletion</h5>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to permanently delete this file?</p>
                </div>
                <div className="modal-footer">
                  <Button color="secondary" onClick={() => setConfirmationModalOpen(false)}>Cancel</Button>
                  <Button color="danger" onClick={() => {permanentDelete(fileToDelete);setConfirmationModalOpen(false)}}>Delete</Button>
                  </div>
              </div>
            </div>
          </div>
        </>
      )}

    </React.Fragment>
  );
};

export default Recovery;
