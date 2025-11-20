import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

export type Vehicle = {
  id: string;
  regNumber: string;
  make: string;
  model: string;
  year?: number | null;
  status?: string | null;
};

type VehiclesQueryData = {
  vehicles: Vehicle[];
};

type VehiclesQueryVars = {
  search?: string;
};

type VehicleQueryData = {
  vehicle: Vehicle;
};

type VehicleQueryVars = {
  id: string;
};

export const VEHICLES_QUERY = gql`
  query Vehicles($search: String) {
    vehicles(search: $search) {
      id
      regNumber
      make
      model
      year
      status
    }
  }
`;

export const VEHICLE_QUERY = gql`
  query Vehicle($id: ID!) {
    vehicle(id: $id) {
      id
      regNumber
      make
      model
      year
      status
    }
  }
`;

export const CREATE_VEHICLE_MUTATION = gql`
  mutation CreateVehicle($regNumber: String!, $make: String, $model: String, $year: Int) {
    createVehicle(regNumber: $regNumber, make: $make, model: $model, year: $year) {
      vehicle {
        id
        regNumber
        make
        model
        year
        status
      }
    }
  }
`;

export const UPDATE_VEHICLE_MUTATION = gql`
  mutation UpdateVehicle($id: ID!, $regNumber: String, $make: String, $model: String, $year: Int) {
    updateVehicle(id: $id, regNumber: $regNumber, make: $make, model: $model, year: $year) {
      vehicle {
        id
        regNumber
        make
        model
        year
        status
      }
    }
  }
`;

export const DELETE_VEHICLE_MUTATION = gql`
  mutation DeleteVehicle($id: ID!) {
    deleteVehicle(id: $id) {
      ok
    }
  }
`;

export const useVehiclesQuery = (search?: string) =>
  useQuery<VehiclesQueryData, VehiclesQueryVars>(VEHICLES_QUERY, {
    variables: { search },
  });

export const useVehicleQuery = (id: string) =>
  useQuery<VehicleQueryData, VehicleQueryVars>(VEHICLE_QUERY, {
    variables: { id },
  });

export const useCreateVehicleMutation = () => useMutation(CREATE_VEHICLE_MUTATION);

export const useUpdateVehicleMutation = () => useMutation(UPDATE_VEHICLE_MUTATION);

export const useDeleteVehicleMutation = () => useMutation(DELETE_VEHICLE_MUTATION);

