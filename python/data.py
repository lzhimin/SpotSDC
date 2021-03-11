import sys
import pandas as pd
import numpy as np
import os
import math


def data_agent(request, app):
    if request["type"] == "masked_boundary":
        data = create_masked_boundary(
            request["indexs"], request["dataset"], app.root_path)
        print("MASKED BOUNDARY", file=sys.stderr)

    elif request["type"] == "resilency_single_run":
        data = single_relative_run(
            request["index"], request["dataset"], app.root_path)
        print("RESILIENCY SINGLE RUN", file=sys.stderr)

    return data


def single_relative_run(index, dataset, root_path):

    result = []
    folder = dataset.split("_")[0]
    filepath = root_path+"/static/data/"+folder+"/"+dataset

    fault_inject_run = pd.read_csv(filepath+"/appstate_"+str(
        index)+".log", sep=" ", names=['file', 'linenum', 'variable', 'value'])
    golden_run = pd.read_csv(filepath+"/golden.log",  sep=" ",
                             names=['file', 'linenum', 'variable', 'value'])

    errors = np.array(fault_inject_run.value[0:len(golden_run)], dtype="float")
    golden = np.array(golden_run.value, dtype="float")
    for j in range(len(golden)):
        if golden[j] != 0:
            error = (errors[j] - golden[j])/golden[j]
        if abs(error) > 1:
            error = math.log10(abs(error)) * error/abs(error)
        else:
            error = 0
        result.append(error)
    return result


def create_masked_boundary(indexs, dataset, root_path):
    # return a masked relative error boundary
    folder = dataset.split("_")[0]
    filepath = root_path+"/static/data/"+folder+"/"+dataset

    dataset_summary = pd.read_csv(root_path+"/static/data/"+dataset+".csv")
    golden_run = pd.read_csv(filepath+"/golden.log",  sep=" ",
                             names=['file', 'linenum', 'variable', 'value'])
    boundary = np.zeros(len(golden_run)) + np.nextafter(0, 1)

    # for i in range(len(golden_run)):
    #    boundary.append({"min": 0, "max": 0})

    for i in indexs:
        if dataset_summary.outcome[int(i)] != "Masked":
            continue

        # whether current run is masked
        fault_inject_run = pd.read_csv(
            filepath+"/appstate_"+str(i)+".log",  sep=' ', names=["file", "linenum", "variable", "value"])
        if len(fault_inject_run) < len(golden_run):
            print("weird!", file=sys.stderr)
            continue

        errors = np.array(
            fault_inject_run.value[0:len(golden_run)], dtype="float")

        # if the current propagation contain nan or inf discard it.
        if np.isnan(errors).any() or np.isinf(errors).any():
            continue

        golden = np.array(golden_run.value, dtype="float")
        for j in range(len(golden_run)):
            if golden[j] != 0:
                error = (errors[j] - golden[j])/golden[j]
                if abs(error) > 1:
                    error = math.log10(abs(error))  # * error/abs(error)
            else:
                error = 0

            if error > boundary[j]:
                boundary[j] = error
            # if error >= 0 and error > boundary[j]["max"]:
            #    boundary[j]["max"] = error

            # if error < 0 and error < boundary[j]["min"]:
            #    boundary[j]["min"] = error

    return boundary.tolist()


# There are three different type of boundaries
# 1. fault tolerance bit boundary
#   bit boundary give the information that until the specific bit the program will run property.
#


def golden_fault_tolerance_boundary():
    pass
