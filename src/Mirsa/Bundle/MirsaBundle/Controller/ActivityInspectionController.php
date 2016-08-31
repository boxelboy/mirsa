<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use BusinessMan\Bundle\JobBundle\Form\Type\ChildJobType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrder;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Mirsa\Bundle\MirsaBundle\Resources\utilities\Filtering;

/**
 * Work Order Inspection Activity Controller
 *
 * @author chris saunders
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class ActivityInspectionController extends Controller
{
    /**
     * List all Work Order Inspection Activity 
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function listAction()
    {
        return $this->render('MirsaMirsaBundle:ActivityInspection:list.html.twig');
    }

    /* Used to export the records, this will also work with the filters */
    public function exportAction(Request $request)
    {
        
        $id = $request->query->get('id');
        $created = $request->query->get('created');
        $sku = $request->query->get('sku');
        $type = $request->query->get('type');
        $plannedStartDate = $request->query->get('plannedStartDate');
        $plannedEndDate = $request->query->get('plannedEndDate');
        $scheduleRequired = $request->query->get('scheduleRequired');
        $assemblyStatus = $request->query->get('assemblyStatus');
        $salesOrderNumber = $request->query->get('saleaOrderNumber');
        $customerName = $request->query->get('customerName');
        $tradingCompany = $request->query->get('tradingCompany');

        $response = new StreamedResponse();
        $response->setCallback(function() use (&$id, &$created, &$sku, &$type, &$plannedStartDate, &$plannedEndDate, &$scheduleRequired, &$assemblyStatus, &$salesOrderNumber, &$customerName, &$tradingCompany) {
            $fc = fopen('php://output', 'w+');
            fputcsv($fc, array('WorkOrder Number', 'Created', 'Part No.', 'Total Job Costs', 'Normal Hours', 'Overtime Hours' , 'Quantity Inspected' , 'Quantity Rejected', 'Type', 'Planned Start', 'Planned End' , 'Schedule Required', 'Status', 'SO No', 'Customer Name', 'Trading Company'),',');
            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:ActivityInspection');
            $qb = $qb->createQueryBuilder('ai');
            $qb = $qb->select('ai.id,ai.created,ai.sku,ai.totalJobCosts,ai.totalTimesheetNormalHours,ai.totalTimesheetOvertimeHours,ai.qtyInspected,ai.qtyRejected,ai.type,ai.plannedStartDate,ai.plannedEndDate,ai.scheduleRequired,ai.assemblyStatus,ai.salesOrderNumber,ai.customerName,ai.tradingCompany');
            $qb = $qb->andWhere('ai.type IN (:defaultType)');
            $qb = $qb->setParameter('defaultType', array('Internal Inspection', 'Inspection', 'External Inspection'));

            $filtering = new Filtering();

            if ($id != "" ) {
                $qb = $qb->andWhere('ai.id = :id');
                $qb = $qb->setParameter('id', $id );
            }  
            if ($created != "" ) {
                $filtering->DateFilter('created', $created, $qb, 'ai');
                //$qb = $qb->andWhere('ai.created = :created');
                //$qb = $qb->setParameter('created', \DateTime::createFromFormat('m/d/Y', $created), 'date');
            }

            if ($sku != "" ) {
                $qb = $qb->andWhere('LOWER(ai.sku) LIKE :sku');
                $qb = $qb->setParameter('sku', '%' . strtolower($sku) . '%');
            }
            if ($type != "" ) {
                $qb = $qb->andWhere('LOWER(ai.type) LIKE :type');
                $qb = $qb->setParameter('type', '%' . strtolower($type) . '%');
            }                     

            if ($plannedStartDate != "" ) {
                $filtering->DateFilter('plannedStartDate', $plannedStartDate, $qb, 'ai');
                //$qb = $qb->andWhere('ai.plannedStartDate = :plannedStartDate');
                //$qb = $qb->setParameter('plannedStartDate', \DateTime::createFromFormat('m/d/Y', $plannedStartDate), 'date');
            }
            if ($plannedEndDate != "" ) {
                $filtering->DateFilter('plannedEndDate', $plannedEndDate, $qb, 'ai');
                //$qb = $qb->andWhere('ai.plannedEndDate = :plannedEndDate');
                //$qb = $qb->setParameter('plannedEndDate', \DateTime::createFromFormat('m/d/Y', $plannedEndDate), 'date');
            }
            if ($scheduleRequired != "" ) {
                $qb = $qb->andWhere('LOWER(ai.scheduleRequired) LIKE :scheduleRequired');
                $qb = $qb->setParameter('scheduleRequired', '%' . strtolower($scheduleRequired) . '%');
            }
            if ($assemblyStatus != "" ) {
                $qb = $qb->andWhere('LOWER(ai.assemblyStatus) LIKE :assemblyStatus');
                $qb = $qb->setParameter('assemblyStatus', '%' . strtolower($assemblyStatus) . '%');
            }
            if ($salesOrderNumber != "" ) {
                $qb = $qb->andWhere('LOWER(ai.salesOrderNumber) LIKE :salesOrderNumber');
                $qb = $qb->setParameter('salesOrderNumber', '%' . strtolower($salesOrderNumber) . '%');
            }            
            if ($customerName != "" ) {
                $qb = $qb->andWhere('LOWER(ai.customerName) LIKE :customerName');
                $qb = $qb->setParameter('customerName', '%' . strtolower($customerName) . '%');
            }
            if ($tradingCompany != "" ) {
                $qb = $qb->andWhere('LOWER(ai.tradingCompany) LIKE :tradingCompany');
                $qb = $qb->setParameter('tradingCompany', '%' . strtolower($tradingCompany) . '%');
            }

            /* Only export the items for the currently logged in client*/
            if (!is_null($this->getUser()->getContact())) { 
                if ($this->getUser()->getContact()->getClient()) {
                    $qb = $qb->andWhere('ai.client = :client');
                    $qb = $qb->setParameter('client', $this->getUser()->getContact()->getClient());
                }
            }
            $qb = $qb->getQuery();
            $activityInspection = $qb->getResult();
            //var_dump($activityInspection);exit;
            
            foreach ($activityInspection as $item)
            {
                if (is_null($item['created'])) {
                    $createdDate = "";
                }else {
                    $createdDate = date_format($item['created'], "m-d-Y");
                }                
                if (is_null($item['plannedStartDate'])) {
                    $startDate = "";
                } else {
                    $startDate = date_format($item['plannedStartDate'], "m-d-Y");
                }
                if (is_null($item['plannedEndDate'])) {
                    $endDate = "";
                } else {
                    $endDate = date_format($item['plannedEndDate'], "m-d-Y");
                }

                fputcsv($fc, array($item['id'],
                                    $createdDate,
                                    $item['sku'],
                                    $item['totalJobCosts'],
                                    $item['totalTimesheetNormalHours'],
                                    $item['totalTimesheetOvertimeHours'],
                                    $item['qtyInspected'],
                                    $item['qtyRejected'],
                                    $item['type'],
                                    $startDate,
                                    $endDate,
                                    $item['scheduleRequired'],
                                    $item['assemblyStatus'],
                                    $item['salesOrderNumber'],
                                    $item['customerName'],
                                    $item['tradingCompany']),
                         ',');
            }
            fclose($fc);
        });
        $filename = "inspection_activity_export_".date("m_d_Y_His").".csv";
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition','attachment; filename=' . $filename);
        return $response;
    }    
}